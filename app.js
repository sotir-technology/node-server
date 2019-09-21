let http = require('http');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let indexRouter = require('./routes/index');
let authRouter = require('./routes/user/account');
let serviceRouter = require('./routes/services/services');
let func = require('./lib/functions');
let app = express();
let token = require('jsonwebtoken');

//App uses
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
//app uses
// Add headers
app.use(func.controlHeader);
//find token in all router
app.all('*', func.tokenController);

app.use('/', indexRouter); //index router
app.use('/user', authRouter); //general login class
app.use('/services', serviceRouter); //general services class

//handle error
app.use('*', function (req, res, next) {
    res.json({'status': false, 'data': [], msg: 'Router not valid...'});
});
//handle error here
//Catch every other error
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.jsonp({
        status: false,
        data: {
            error: "Something went wrong at the server side.",
            reason: err.message
        },
        msg: 'Server side error'
    })
});
//start our simple server
let port = 3001;
app.set('port', port);
let server = http.createServer(app);
server.listen(port);

module.exports = app;
