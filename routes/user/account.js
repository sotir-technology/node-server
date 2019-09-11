let express = require('express');
let router = express.Router();
let db = require('./../../lib/Db');
let func = require('./../../lib/functions');

//start creating account for church
router.post('/create', function (req, res, next) {
    let ui = req.body; //User info...
    if (func.checkJSONValuesExpect(ui, 7)) {
        //save data
        let dbData = {
            a_name: ui.name,
            a_email: ui.email,
            a_phone: ui.phone,
            a_country: ui.country,
            a_state: ui.state,
            a_street: ui.street,
            a_password: func.sha1Pass(ui.password),
        };
        //push to db
        db.Account.findOrCreate({where: {a_email: ui.email}, defaults: dbData})
            .then(([account, created]) => {
                let plainData = account.get({plain: true});
                if (created) {
                    res.jsonp({status: true, data: plainData, msg: 'success'})
                } else {
                    res.jsonp({
                        status: false,
                        data: [],
                        msg: plainData.a_name + " already exist with " + plainData.a_email + ", try re-login"
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
        db.Account.findOne({where: {a_email: ui.email, a_password: func.sha1Pass(ui.password)}})
            .then((account) => {
                if (account) {
                    account.update({a_token: func.sha1Pass(ui.email + new Date().toUTCString())});
                    res.jsonp({status: true, data: account.get({plain: true}), msg: 'Successful'})
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
        db.Account.findOne({where: {a_token: ui.token}})
            .then(account => {
                if (account) {
                    res.jsonp({
                        status: true,
                        data: account.get({plain: true}),
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
            .then(account => {
                if (account) {
                    res.jsonp({
                        status: true,
                        data: account.get({plain: true}),
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
