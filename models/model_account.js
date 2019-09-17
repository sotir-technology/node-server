/**
 Author: Revelation Ben
 Company: RSC Byte Limited
 Email: nusktecsoft@gmail.com
 Phone: 2348164242320
 **/
let {sequelize, Sequelize, db_prefix} = require('./../lib/Db');

//Start class user model
class Account extends Sequelize.Model {
}

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
}, {sequelize, modelName: db_prefix + 'account'});

//start account recovery class
class RecoverAcc extends Sequelize.Model {
}

RecoverAcc.init({
    r_id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    r_email: {type: Sequelize.STRING, unique: true, allowNull: false},
    r_token: {type: Sequelize.STRING, allowNull: false},
    r_status: {type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false},
}, {sequelize, modelName: db_prefix + "pswrec"});
//synchronize all the tables
sequelize.sync();
module.exports = {Account, RecoverAcc};
