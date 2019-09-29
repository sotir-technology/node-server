/**
 Author: Revelation Ben
 Company: RSC Byte Limited
 Email: nusktecsoft@gmail.com
 Phone: 2348164242320
 **/
let token = require('jsonwebtoken');
const secrete = "ChurchA2ZApp";
const exp = '10d';

class TokenAuth {
    static sign(data) {
        return token.sign(data, secrete, {expiresIn: exp});
    }
    static verify(tokenKey, res, cbk) {
        token.verify(tokenKey, secrete, (err, data) => {
            if (!err) {
                cbk(data);
            } else {
                res.jsonp({status: false, data: [], msg: 'Invalid token supplied !'})
            }
        })
    }
}

module.exports = TokenAuth;
