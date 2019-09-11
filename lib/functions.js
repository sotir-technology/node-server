let offLogging = false;
let md5 = require('sha1');
let constants = require('./constants');
//determine header control
const controlHeader = function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080,surge.sh');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
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
    return !filtered.includes(false) && filtered.length > expect - 1;
};
//convert string to md5 for password
const sha1Pass = function (str) {
    return md5(str);
};
//Global console write
const globalLogs = function (msg) {
    if (!offLogging) {
        console.log(msg);
    }
};
module.exports = {controlHeader, tokenController, checkJSONValues, sha1Pass, globalLogs, checkJSONValuesExpect};
