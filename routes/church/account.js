let express = require('express');
let router = express.Router();
let db = require('./../../lib/Db');
let func = require('./../../lib/functions');

//start creating account for church
router.post('/create', function (req, res, next) {
    let ui = req.body; //User info...
    if (func.checkJSONValuesExpect(ui, 8)) {
        //save data
        let dbData = {
            c_name: ui.name,
            c_email: ui.email,
            c_phone: ui.phone,
            c_country: ui.country,
            c_state: ui.state,
            c_street: ui.street,
            c_founder: ui.founder,
            c_password: func.md5Pass(ui.password),
        };
        //push to db
        db.Churches.findOrCreate({where: {c_email: ui.email}, defaults: dbData})
            .then(([church, created]) => {
                let plainData = church.get({plain: true});
                if (created) {
                    res.jsonp({status: true, data: plainData, msg: 'success'})
                } else {
                    res.jsonp({
                        status: false,
                        data: [],
                        msg: plainData.c_name + " already exist with " + plainData.c_email + ", try re-login"
                    })
                }
            })
            .catch(err => {
                console.log(new Date().toUTCString(), err);
                res.jsonp({
                    status: false,
                    data: [],
                    msg: 'Error, something went wrong on the server side. Maybe data in-complete '
                })
            });
    } else {
        res.jsonp({status: false, data: [], msg: 'Supplied data contain an empty fields'})
    }
});
//login function here
router.post('/login', function (req, res, next) {
    let ui = req.body; //User info...
    if (func.checkJSONValuesExpect(ui, 2)) {
        db.Churches.findOne({where: {c_email: ui.email, c_password: func.md5Pass(ui.password)}})
            .then((church) => {
                if (church) {
                    church.update({c_token: func.md5Pass(ui.email + new Date().toUTCString())});
                    res.jsonp({status: true, data: church.get({plain: true}), msg: 'Successful'})
                } else {
                    res.jsonp({status: false, data: [], msg: 'Invalid user account details'})
                }
            })
            .catch(err => {
                func.globalLogs(err);
                res.jsonp({status: false, data: [], msg: 'Server side error or improper data composition'})
            })
    } else {
        res.jsonp({status: false, data: [], msg: 'Supplied data contain an empty fields or not proper'})
    }
});
//start pulling account by token
router.post('/get', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesExpect(ui, 1)) {
        db.Churches.findOne({where: {c_token: ui.token}})
            .then(church => {
                if (church) {
                    res.jsonp({
                        status: true,
                        data: church.get({plain: true}),
                        msg: 'Success'
                    })
                } else {
                    res.jsonp({status: false, data: [], msg: 'Invalid token supplied...'})
                }
            })
            .catch(err => {
                res.jsonp({status: false, data: [], msg: 'An error has occur, server side'})
            })
    } else {
        res.jsonp({status: false, data: [], msg: 'Supplied data contain an empty fields'})
    }
});
//forgot account
router.post('/forgot', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesExpect(ui, 1)) {
        db.Churches.findOne({where: {c_token: ui.token}})
            .then(church => {
                if (church) {
                    res.jsonp({
                        status: true,
                        data: church.get({plain: true}),
                        msg: 'Success'
                    })
                } else {
                    res.jsonp({status: false, data: [], msg: 'Invalid token supplied...'})
                }
            })
            .catch(err => {
                res.jsonp({status: false, data: [], msg: 'An error has occur, server side'})
            })
    } else {
        res.jsonp({status: false, data: [], msg: 'Supplied data contain an empty fields'})
    }
});

module.exports = router;
