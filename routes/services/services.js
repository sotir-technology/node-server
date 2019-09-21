let express = require('express');
let router = express.Router();
let dbAcc = require('./../../models/model_account');
let dbServ = require('./../../models/model_services');
let func = require('./../../lib/functions');
let token = require('jsonwebtoken');

//start creating account for church
router.post('/get', function (req, res, next) {
    dbServ.Services.findAll({where: {s_status: true}})
        .then(result => {
            if (result.length > 0) {
                res.jsonp({status: true, data: result, msg: 'Available services listing'});
            } else {
                res.jsonp({status: false, data: [], msg: 'No available service data'});
            }
        })
        .catch(err => {
            console.log(err);
            res.jsonp({status: false, data: [], msg: 'No available service data'});
        })
});
//add services
router.post('/add', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesExpect(ui, 5)) {
        func.tokenApi(ui.token, res, (dec) => {
            if (!ui.email || !ui.password) {
                res.jsonp({
                    status: false,
                    data: [],
                    msg: 'Email and password must be set !'
                });
                return;
            }
            let identity = func.randomStr(3, 10, false, true);
            if (ui.identity) {
                identity = ui.identity;
            }
            let service_data = {
                us_user: dec.a_id,
                s_id: ui.serviceType,
                us_enabled: ui.isEnabled,
                us_identity: identity,
                us_email: ui.email,
                us_password: func.sha1Pass(ui.password),
            };
            dbServ.UServices.findOrCreate({
                where: {us_user: dec.a_id, s_id: ui.serviceType, us_identity: identity},
                defaults: service_data
            })
                .then(([service, isNew]) => {
                    if (isNew) {
                        res.jsonp({
                            status: true,
                            data: service.get({plain: true}),
                            msg: 'Newly added data'
                        });
                    } else {
                        if (ui.rePurchased) {
                            service.update({us_enabled: ui.isEnabled});
                            res.jsonp({
                                status: true,
                                data: service.get({plain: true}),
                                msg: 'Updated an existing data'
                            });
                        } else {
                            res.jsonp({
                                status: true,
                                data: service.get({plain: true}),
                                msg: 'Updated an existing data'
                            });
                        }
                    }
                })
                .catch(err => {
                    res.jsonp({
                        status: false,
                        data: [],
                        msg: 'Could not get return purchase data, probably data error'
                    });
                })
        })
    } else {
        res.jsonp({status: false, data: [], msg: 'Supplied data contain an empty fields'});
    }
});
// list user associated services
router.post('/get-services', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesFalse(ui)) {
        func.tokenApi(ui.token, res, (dec) => {
            dbServ.UServices.findAll({
                where: {us_user: dec.a_id}, include: [{model: dbServ.Services, required: true, as: 'services'}]
            })
                .then(result => {
                    let data = JSON.stringify(result);
                    data = JSON.parse(data);
                    res.jsonp({
                        status: true,
                        data: data,
                        msg: 'Success !'
                    })
                })
                .catch(err => {
                    res.jsonp({status: false, data: [], msg: 'Server side error, contact developer'})
                })
        })
    } else {
        res.jsonp({status: false, data: [], msg: 'Expected object value contain empty data'})
    }
});
// update user purchased services
router.post('/update-service', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesExpect(ui, 5)) {
        func.tokenApi(ui.token, res, (dec) => {
            if (ui.us_enabled || ui.us_services) {
                res.jsonp({
                    status: false,
                    data: [],
                    msg: 'Status and Identity are not permitted to be updated, remove and try again'
                });
                return;
            }
            if (!ui.us_email) {
                res.jsonp({
                    status: false,
                    data: [],
                    msg: 'Email and password not presents, include and try again'
                });
                return;
            }
            //make a password
            if (ui.isNew && ui.us_password) {
                ui.us_password = func.sha1Pass(ui.us_password);
            } else if (ui.isNew && !ui.us_password) {
                res.jsonp({
                    status: false,
                    data: [],
                    msg: 'You tried to update password but no accurate object was passed'
                });
                return;
            }
            //push to db
            dbServ.UServices.findOne({where: {s_id: ui.s_id, us_identity: ui.identity, us_user: dec.a_id}})
                .then(updated => {
                    if (updated) {
                        //do update here
                        updated.update(ui);
                        res.jsonp({
                            status: true,
                            data: updated.get({plain: true}),
                            msg: 'Updated ' + (ui.isNew ? 'and new password was set' : '!')
                        });
                    } else {
                        res.jsonp({
                            status: false,
                            data: [],
                            msg: 'Unable to update your data, key point is missing / invalid'
                        });
                    }
                })
                .catch(err => {
                    res.jsonp({status: false, data: [], msg: 'Server side error during db trx'});
                })
        })
    } else {
        res.jsonp({status: false, data: [], msg: 'Expected value does\'t meet server requirements'});
    }
});
//login into your service
router.post('/login', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesFalse(ui)) {
        let email = ui.email;
        let password = func.sha1Pass(ui.password);
        dbServ.UServices.findOne({
            where: {us_email: email, us_password: password, us_enabled: 1},
            include: [{model: dbServ.Services, as: 'services'}]
        })
            .then(service => {
                if (service) {
                    let d = JSON.stringify(service);
                    d = JSON.parse(d);
                    d.token = token.sign(d, func.tokenConfig.secrete, {expiresIn: func.tokenConfig.exp});
                    res.jsonp({status: true, data: d, msg: 'Success !'});
                } else {
                    res.jsonp({status: false, data: [], msg: 'Invalid service login details'});
                }
            })
            .catch(err => {
                res.jsonp({status: false, data: [], msg: 'Service error occur at server side..'});
            })
    } else {
        res.jsonp({status: false, data: [], msg: 'Expected value does\'t meet the server requirement'});
    }
});
//blank router
router.post('/blank', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesFalse(ui)) {
        func.tokenApi(ui.token, res, (dec) => {

        })
    } else {
        res.jsonp({status: false, data: [], msg: 'Expected value does\'t meet the server requirement'});
    }
});
module.exports = router;
