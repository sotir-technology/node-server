let offLogging = false;
let md5 = require('sha1');
let constants = require('./constants');
let token = require('jsonwebtoken');
//my secrete keys
const tokenConfig = {secrete: "ChurchA2ZApp", exp: '5d'};
//determine header control
const controlHeader = function (req, res, next) {

    // Website you wish to allow to connect
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
};
//token and server keys
const tokenController = function (req, res, next) {
    //perform  rejection on wrong router
    if (req.query.ssk === constants.SSK) {
        next();
    } else {
        res.jsonp({
            status: false,
            data: [],
            msg: 'Server key has not been authenticated or invalid ssk'
        })
    }
};
//check for json null but ignore false
const checkJSONValuesFalse = function (data) {
    let filtered = [];
    if (typeof (data) === "object" && data != null) {
        //if is empty return early
        if (Object.keys(data).length < 1) {
            return false;
        }
        //iterate
        for (let key in data) {
            if (data.hasOwnProperty(key) && ((!/^\s*$/.test(data[key])))) {
                filtered.push(true);
            } else {
                filtered.push(false);
            }
        }
    } else {
        return false;
    }
    //finalized
    return !filtered.includes(false);
};
//check for json null
const checkJSONValues = function (data) {
    let filtered = [];
    if (typeof (data) === "object" && data != null) {
        //if is empty return early
        if (Object.keys(data).length < 1) {
            return false;
        }
        //iterate
        for (let key in data) {
            if (data.hasOwnProperty(key) && (!(!data[key]) && (!/^\s*$/.test(data[key])))) {
                filtered.push(true);
            } else {
                filtered.push(false);
            }
        }
    } else {
        return false;
    }
    //finalized
    return !filtered.includes(false);
};
//check with expectation
const checkJSONValuesExpect = function (data, expect) {
    let filtered = [];
    if (typeof (data) === "object" && data != null) {
        //if is empty return early
        if (Object.keys(data).length < 1) {
            return expect === 0;
        }
        //iterate
        for (let key in data) {
            if (data.hasOwnProperty(key) && ((!/^\s*$/.test(data[key])))) {
                filtered.push(true);
            } else {
                filtered.push(false);
            }
        }
    } else {
        return false;
    }
    //finalized
    return !filtered.includes(false) && filtered.length > expect - 1;
};
//convert string to md5 for password
const sha1Pass = function (str) {
    return md5(str);
};
//Constant email sender configuration
const sendmail = require('sendmail')({
    logger: {
        debug: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error
    }, silent: true,
});
const sendMail = function (to, sub, data) {
    sendmail({
        from: 'no-reply@churcha2z.org',
        to: to,
        subject: sub,
        html: data,
    }, function (err, reply) {
        console.log(err && err.stack);
        console.dir(reply);
        console.log("Email sent !", to);
    });
};
//Global console write
const randomStr = function (type = 1, length = 5, specialChar = false, toUpper = false) {
    let alpha = "ABCDEFGHIJKLMNOPQRSTUVWSYZ";
    let salpha = "abcdefghijklmnopqrstuvwsyz";
    let num = "1234567890";
    let sChar = "@!#&/";
    let combine = "";
    if (type === 1) {
        combine = num;
    } // number only
    if (type === 2) {
        combine = alpha;
    } //alpha only
    if (type === 3) {
        combine = num + alpha + salpha;
    } // Join number and alpha

    //filter special char
    if (specialChar) {
        combine += sChar;
    } // add special characters
    if (length > combine.length) {
        length = combine.length;
    }
    let buildStr = "";
    for (let i = 0; i < length; i++) {
        let rnd = Math.floor(Math.random() * combine.length - 1);
        buildStr += combine.charAt(rnd);
    }
    return toUpper ? buildStr.toUpperCase() : buildStr;
};
const globalLogs = function (msg) {
    if (!offLogging) {
        console.log(msg);
    }
};
//token holder
const tokenApi = function (tokenKey, res, callback) {
    token.verify(tokenKey, tokenConfig.secrete, (err, dec) => {
        if (!err) {
            callback(dec);
        } else {
            callback(false);
            res.jsonp({status: false, data: [], msg: 'Invalid token or expired...'})
        }
    });
};
module.exports = {
    controlHeader,
    tokenController,
    checkJSONValues,
    sha1Pass,
    globalLogs,
    checkJSONValuesExpect,
    checkJSONValuesFalse,
    sendMail,
    randomStr,
    tokenConfig,
    tokenApi
};
