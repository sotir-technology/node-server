/**
 Author: Revelation Ben
 Company: RSC Byte Limited
 Email: nusktecsoft@gmail.com
 Phone: 2348164242320
 **/
let {sequelize, Sequelize, db_prefix} = require('./../lib/Db');

//create service class
class Services extends Sequelize.Model {
}
//service objects
Services.init({
    s_id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    s_desc: {type: Sequelize.STRING, allowNull: false},
    s_cost: {type: Sequelize.STRING, allowNull: false},
    s_status: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},
}, {sequelize, modelName: db_prefix + "services"});

//create module class

sequelize.sync();

module.exports = {Services};
