//Require library
const Sequelize = require("sequelize");
//db prefix
const db_prefix = "ca_";
//db connections initializations and connections
const sequelize = new Sequelize('ca2zdb', 'root', 'mysql', {dialect: 'mysql', logging: false});
//const sequelize = new Sequelize('chureskd_cha2z', 'chureskd_sotir', 'U]be$T[t5afA', {dialect: 'mysql', logging: false});

//export all modules
module.exports = {sequelize, Sequelize, db_prefix};
