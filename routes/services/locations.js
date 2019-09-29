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
            where: {l_email: email, l_password: password, us_enabled: 1},
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
