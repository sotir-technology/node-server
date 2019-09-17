let express = require('express');
let router = express.Router();
let dbAcc = require('./../../models/model_account');
let dbServ = require('./../../models/model_services');
let func = require('./../../lib/functions');

//start creating account for church
router.post('/get', function (req, res, next) {
    dbServ.Services.findAll({where: {s_status: true}})
        .then(result => {
            if(result.length > 0){
                res.jsonp({status: true, data: result, msg: 'Available services listing'});
            }else{
                res.jsonp({status: false, data: [], msg: 'No available service data'});
            }
        })
        .catch(err => {
            console.log(err);
            res.jsonp({status: false, data: [], msg: 'No available service data'});
        })
});

module.exports = router;
