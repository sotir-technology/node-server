let express = require('express');
let router = express.Router();
let dbAcc = require('./../../models/model_account');
let dbServ = require('./../../models/model_services');
let func = require('./../../lib/functions');
let token = require('jsonwebtoken');
let tokenAuth = require('./../../lib/TokenAuth');

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
            dbServ.UServices.findOne({where: {us_email: ui.email,}})
                .then(found => {
                    if (!found) {
                        dbServ.UServices.create(service_data)
                            .then(service => {
                                if (service) {
                                    res.jsonp({
                                        status: true,
                                        data: service.get({plain: true}),
                                        msg: 'Newly added data'
                                    });
                                } else {
                                    res.jsonp({
                                        status: false,
                                        data: service.get({plain: true}),
                                        msg: 'Unable to add new records'
                                    });
                                }
                            })
                    } else {
                        dbServ.UServices.update(service_data, {
                            where: {
                                us_email: ui.email,
                                us_user: dec.a_id,
                                s_id: ui.serviceType
                            }
                        })
                            .then(updated => {
                                res.jsonp({
                                    status: true,
                                    data: updated,
                                    msg: 'User service updated !'
                                });
                            })
                            .catch(err => {
                                res.jsonp({
                                    status: false,
                                    data: [],
                                    msg: 'Unable to update user data'
                                });
                            })
                    }
                });
        });
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
                    d.token = tokenAuth.sign({
                        us_id: d.us_id,
                        us_email: d.us_email,
                        us_identity: d.us_identity,
                        us_enabled: d.us_enabled
                    });
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

///START EXTERNAL SERVICE PERFORMANCE////
//PASTOR GET
router.post('/pastor-get', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesFalse(ui)) {
        tokenAuth.verify(ui.token, res, cbk => {
            dbServ.UPastors.findAll({where: {us_id: cbk.us_id}})
                .then(pastors => {
                    if (pastors) {
                        let pst = JSON.stringify(pastors);
                        res.jsonp({status: true, data: JSON.parse(pst), msg: 'Pastors successfully loaded !'});
                    } else {
                        res.jsonp({status: false, data: [], msg: 'No pastor entries...'});
                    }
                })
                .catch(err => {
                    res.jsonp({status: false, data: [], msg: 'Error fetching pastors...'});
                })
        });
    } else {
        res.jsonp({status: false, data: [], msg: 'Expected value does\'t meet the server requirement'});
    }
});
//PASTOR ADD
router.post('/pastor-add', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesFalse(ui)) {
        tokenAuth.verify(ui.token, res, cbk => {
            let data = ui.data;
            data.us_id = cbk.us_id;
            dbServ.UPastors.findOrCreate({where: {p_email: data.p_email}, defaults: data})
                .then(([result, created]) => {
                    if (created) {
                        res.jsonp({
                            status: true,
                            data: result.get({plain: true}),
                            msg: 'Pastor created successfully'
                        });
                    } else {
                        res.jsonp({
                            status: true,
                            data: result.get({plain: true}),
                            msg: 'Pastor account already exist'
                        });
                    }
                })
                .catch(err => {
                    res.jsonp({status: false, data: [], msg: 'Error adding up a new pastor'});
                })
        });
    } else {
        res.jsonp({status: false, data: [], msg: 'Expected value does\'t meet the server requirement'});
    }
});
//PASTOR UPDATE
router.post('/pastor-update', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesFalse(ui)) {
        tokenAuth.verify(ui.token, res, cbk => {
            let data = ui.data;
            dbServ.UPastors.findOne({where: {p_email: ui.email, us_id: cbk.us_id}})
                .then(pastor => {
                    if (pastor) {
                        pastor.update(data);
                        res.jsonp({status: true, data: pastor, msg: 'Updated Successfully !'});
                    } else {
                        res.jsonp({status: false, data: [], msg: 'No matching pastor for update, use valid email'});
                    }
                })
                .catch(err => {
                    res.jsonp({status: false, data: [], msg: 'Error occur updating pastor'});
                })
        });
    } else {
        res.jsonp({status: false, data: [], msg: 'Expected value does\'t meet the server requirement'});
    }
});
//PASTOR DELETE
router.post('/pastor-delete', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesFalse(ui)) {
        tokenAuth.verify(ui.token, res, cbk => {
            dbServ.UPastors.destroy({where: {p_email: ui.email, us_id: cbk.us_id}})
                .then(destroyed => {
                    if (destroyed) {
                        res.jsonp({status: true, data: [], msg: 'Pastor deleted !'});
                    } else {
                        res.jsonp({status: false, data: [], msg: 'Not a valid pastor email address'});
                    }
                })
                .catch(err => {
                    res.jsonp({status: false, data: [], msg: 'Error deleting / removing pastor'});
                })
        });
    } else {
        res.jsonp({status: false, data: [], msg: 'Expected value does\'t meet the server requirement'});
    }
});
//LOCATION GET
router.post('/location-get', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesFalse(ui)) {
        tokenAuth.verify(ui.token, res, cbk => {
            dbServ.ULocations.findAll({where: {us_id: cbk.us_id}})
                .then(location => {
                    if (location) {
                        let locs = JSON.stringify(location);
                        res.jsonp({status: true, data: JSON.parse(pst), msg: 'Location successfully loaded !'});
                    } else {
                        res.jsonp({status: false, data: [], msg: 'No location entries...'});
                    }
                })
                .catch(err => {
                    res.jsonp({status: false, data: [], msg: 'Error fetching pastors...'});
                })
        });
    } else {
        res.jsonp({status: false, data: [], msg: 'Expected value does\'t meet the server requirement'});
    }
});
//LOCATION ADD AND ASSIGN PASTOR
router.post('/location-add', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesFalse(ui)) {
        tokenAuth.verify(ui.token, res, cbk => {
            let data = ui.data;
            data.us_id = cbk.us_id;
            data.l_password = func.sha1Pass(ui.data.l_password);
            dbServ.ULocations.findOrCreate({where: {l_email: ui.email}, defaults: data})
                .then(([location, created]) => {
                    if (created) {
                        res.jsonp({status: true, data: location.get({plain: true}), msg: 'Locations created !'});
                    } else {
                        res.jsonp({status: false, data: [], msg: 'Location already exist...'});
                    }
                })
                .catch(err => {
                    res.jsonp({status: false, data: [], msg: 'Error creating new location.'});
                })
        });
    } else {
        res.jsonp({status: false, data: [], msg: 'Expected value does\'t meet the server requirement'});
    }
});
//LOCATION UPDATE
router.post('/location-update', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesFalse(ui)) {
        tokenAuth.verify(ui.token, res, cbk => {
            dbServ.ULocations.findOne({where: {l_email: ui.email}})
                .then(result => {
                    if (result) {
                        //check if password change required
                        let d = ui.data;
                        if (d.l_new_password) {
                            d.l_password = func.sha1Pass(d.l_new_password);
                        }
                        result.update(d);
                        res.jsonp({status: true, data: result, msg: 'Successfully updated !'});
                    } else {
                        res.jsonp({status: false, data: [], msg: 'No email related location found...'});
                    }
                })
                .catch(err => {
                    res.jsonp({status: false, data: [], msg: 'Error updating location data'});
                })
        });
    } else {
        res.jsonp({status: false, data: [], msg: 'Expected value does\'t meet the server requirement'});
    }
});
//LOCATION DELETE
router.post('/location-delete', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesFalse(ui)) {
        tokenAuth.verify(ui.token, res, cbk => {
            dbServ.ULocations.destroy({where: {l_email: ui.email}})
                .then(result => {
                    res.jsonp({status: true, data: [], msg: 'Successfully deleted !'});
                })
                .catch(err => {
                    res.jsonp({status: false, data: [], msg: 'Unable to delete location'});
                })
        });
    } else {
        res.jsonp({status: false, data: [], msg: 'Expected value does\'t meet the server requirement'});
    }
});
//blank router
router.post('/blank', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesFalse(ui)) {
        tokenAuth.verify(ui.token, res, cbk => {

        });
    } else {
        res.jsonp({status: false, data: [], msg: 'Expected value does\'t meet the server requirement'});
    }
});
module.exports = router;
