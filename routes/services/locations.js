let express = require('express');
let router = express.Router();
let dbAcc = require('./../../models/model_account');
let dbServ = require('./../../models/model_services');
let func = require('./../../lib/functions');
let token = require('jsonwebtoken');
let tokenAuth = require('./../../lib/TokenAuth');

//login into your service
router.post('/login', function (req, res, next) {
    let ui = req.body;
    if (func.checkJSONValuesFalse(ui)) {
        let email = ui.email;
        let password = func.sha1Pass(ui.password);
        dbServ.ULocations.findOne({
            where: {l_email: email, l_password: password, l_enabled: 1},
            include: [{model: dbServ.UPastors, as: 'upastors'}]
        })
            .then(locations => {
                if (locations) {
                    let d = JSON.stringify(locations);
                    d = JSON.parse(d);
                    d.token = tokenAuth.sign({
                        l_id: d.l_id,
                        l_email: d.l_email,
                        l_enabled: d.l_enabled
                    });
                    res.jsonp({status: true, data: d, msg: 'Success !'});
                } else {
                    res.jsonp({status: false, data: [], msg: 'Invalid location login details'});
                }
            })
            .catch(err => {
                res.jsonp({status: false, data: [], msg: 'Location error occur at server side..'});
            })
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
