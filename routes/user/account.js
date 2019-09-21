let express = require('express');
let router = express.Router();
let db = require('./../../models/model_account');
let dbservices = require('./../../models/model_services');
let func = require('./../../lib/functions');
let token = require('jsonwebtoken');

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
                    //make a standard token
                    let tkey = token.sign(account.get({plain: true}), func.tokenConfig.secrete, {expiresIn: func.tokenConfig.exp});
                    account.update({a_token: tkey});
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
//start updating by token
router.post('/update-acc', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesFalse(ui)) {
        //updated account
        db.Account.findOne({where: {a_token: ui.token}})
            .then((account) => {
                //apply updates
                account.update(ui);
                res.jsonp({status: true, data: account.get({plain: true}), msg: 'Success'});
            })
            .catch((err) => {
                res.jsonp({status: false, data: ui, msg: 'Cannot update non existing user account'});
            })
    } else {
        res.jsonp({status: false, data: [], msg: 'Supplied data contain an empty fields'});
    }
});
//start updating password by token
router.post('/update-psw', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValues(ui)) {
        //updated account
        db.Account.findOne({where: {a_token: ui.token}})
            .then((account) => {
                //check for password equality
                if (func.sha1Pass(ui.pass2) === account.a_password) {
                    //apply updates
                    account.update({a_password: func.sha1Pass(ui.pass1)});
                    res.jsonp({status: true, data: account.get({plain: true}), msg: 'Password changed, success !'});
                } else {
                    //password not confirmed
                    res.jsonp({status: false, data: account.get({plain: true}), msg: 'Wrong old password !'});
                }
            })
            .catch((err) => {
                res.jsonp({status: false, data: ui, msg: 'Cannot update non existing user password'});
            })
    } else {
        res.jsonp({status: false, data: [], msg: 'Supplied data contain an empty fields'});
    }
});
//request account password
router.post('/request-psw-reset', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesExpect(ui, 1)) {
        //arrange reset token
        db.Account.findOne({where: {a_email: ui.email}})
            .then(user => {
                if (user) {
                    let newResetToken = func.sha1Pass(new Date().toUTCString() + ui.email);
                    db.RecoverAcc.findOrCreate({
                        where: {r_email: ui.email},
                        defaults: {r_email: ui.email, r_token: newResetToken}
                    })
                        .then(([acc, created]) => {
                            if (!acc) {
                                res.jsonp({status: false, data: ui, msg: 'Cannot reset password for non-existing user'})
                                return;
                            }
                            //email data
                            let data = "<h2>Hi, " + user.a_name.split(" ")[0] + "</h2>" +
                                "<h5>You just made a password reset command at " + new Date().toUTCString() + "</h5>" +
                                "<p>If you didn't perform this action, please ignore this otherwise use the link below to reset you password</p>" +
                                "<a href='http://churcha2z.org/account/reset/'>" + newResetToken + "</a><br>Contact Us: admin@churcha2z.orh";
                            if (created) {
                                //created newly
                                func.sendMail(ui.email, "ChurchA2z PswRest", data);
                                //print success after email sent
                                res.jsonp({
                                    status: true,
                                    ui,
                                    msg: 'Account reset token generated and sent to your mail'
                                })
                            } else {
                                func.sendMail(ui.email, "ChurchA2z PswRest", data);
                                acc.update({r_token: newResetToken, r_status: false});
                                res.jsonp({
                                    status: true,
                                    ui,
                                    msg: 'Account reset token re-generated and sent to your mail'
                                })
                            }
                        })
                        .catch((err) => {
                            res.jsonp({status: false, data: ui, msg: 'Cannot reset password for non-existing user'})
                        });
                } else {
                    res.jsonp({status: false, data: ui, msg: 'Cannot request password reset for non-existing user'})
                }
            })
            .catch(err => {
                res.jsonp({status: false, data: ui, msg: 'Temporal error, please try again'})
            })
    } else {
        res.jsonp({status: false, data: [], msg: 'Supplied data contain an empty fields'})
    }
});
// update forgot password
router.post('/forgot-psw/:token?', function (req, res, next) {
    let ui = req.body;
    let ptoken = req.params.token;
    if (func.checkJSONValuesExpect(ui, 0)) {
        //change password on token valid
        if (!ptoken) {
            res.jsonp({status: false, data: [], msg: 'Resetting route not well formed, token is missing'});
            return;
        }
        //proceed to check if token is available
        db.RecoverAcc.findOne({where: {r_token: ptoken, r_status: false}})
            .then((rec) => {
                if (rec) {
                    //account found and never reset
                    let newpassword = func.randomStr(3, 10);
                    db.Account.findOne({where: {a_email: rec.r_email}})
                        .then(acc => {
                            if (acc) {
                                //update password
                                acc.update({a_password: func.sha1Pass(newpassword)});
                                res.jsonp({
                                    status: true,
                                    data: {email: rec.r_email, newpass: newpassword},
                                    msg: 'Password has been reset randomly, login with the new password'
                                })
                            } else {
                                res.jsonp({
                                    status: false,
                                    data: [],
                                    msg: "Could not find the initiator or password recovery token"
                                })
                            }
                        })
                        .catch(err => {
                            res.jsonp({status: false, data: [], msg: "Unable to update user password, try again"})
                        });
                    //update token details
                    rec.update({r_status: true});
                } else {
                    //account not found or used token
                    res.jsonp({status: false, data: [], msg: "Broken token or used already token supplied..."})
                }
            })
            .catch(err => {
                res.jsonp({status: false, data: [], msg: 'Something went wrong on the server side, try again'})
            })
    } else {
        res.jsonp({status: false, data: [], msg: 'Supplied data contain an empty fields'})
    }
});
//testing router
router.post('/test', (req, res, next) => {
    console.log(req.body);
    res.send(req.body);
    next();
});
module.exports = router;
