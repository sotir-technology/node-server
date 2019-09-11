//Require library
const Sequelize = require("sequelize");
//db prefix
const db_prefix = "ca_";
//db connections initializations and connections
const sequelize = new Sequelize('ca2zdb', 'root', 'mysql', {dialect: 'mysql', logging: false});

//Start class user model
class Account extends Sequelize.Model {}
Account.init({
    a_id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    a_name: {type: Sequelize.STRING, allowNull: false},
    a_email: {type: Sequelize.STRING, allowNull: false, unique: true},
    a_phone: {type: Sequelize.STRING, allowNull: false},
    a_password: {type: Sequelize.STRING, allowNull: false},
    a_country: {type: Sequelize.STRING, allowNull: false},
    a_state: {type: Sequelize.STRING, allowNull: false},
    a_street: {type: Sequelize.STRING, allowNull: false},
    a_role: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
    a_enable: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 1},
    a_date: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
    a_token: {type: Sequelize.STRING, defaultValue: '', allowNull: false},
}, {sequelize, modelName: db_prefix+'account'});

//synchronize all the tables
sequelize.sync();
//export all modules
module.exports = {Account};
