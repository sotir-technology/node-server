let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let indexRouter = require('./routes/index');
let authRouter = require('./routes/church/account');
let func = require('./lib/functions');
let app = express();

//import db and initialized
let db = require('./lib/Db');

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
app.use('/church', authRouter); //general login class

//handle error
app.use('*', function (req, res, next) {
    res.json({'status': false, 'data': [], msg: 'Router not valid...'});
});
module.exports = app;
