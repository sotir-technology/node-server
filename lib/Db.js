//Require library
const Sequelize = require("sequelize");
//db prefix
const db_prefix = "ca_";
//db connections initializations and connections
const sequelize = new Sequelize('ca2zdb', 'root', 'mysql', {dialect: 'mysql', logging: false});

//Start class user model
class Churches extends Sequelize.Model {}
Churches.init({
    c_id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    c_name: {type: Sequelize.STRING, allowNull: false},
    c_email: {type: Sequelize.STRING, allowNull: false, unique: true},
    c_phone: {type: Sequelize.STRING, allowNull: false},
    c_founder: {type: Sequelize.STRING, allowNull: false},
    c_password: {type: Sequelize.STRING, allowNull: false},
    c_country: {type: Sequelize.STRING, allowNull: false},
    c_state: {type: Sequelize.STRING, allowNull: false},
    c_street: {type: Sequelize.STRING, allowNull: false},
    c_role: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
    c_enable: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 1},
    c_date: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
    c_token: {type: Sequelize.STRING, defaultValue: '', allowNull: false},
}, {sequelize, modelName: db_prefix+'churches'});

//synchronize all the tables
sequelize.sync();
//export all modules
module.exports = {Churches};
