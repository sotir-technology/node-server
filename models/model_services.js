/**
 Author: Revelation Ben
 Company: RSC Byte Limited
 Email: nusktecsoft@gmail.com
 Phone: 2348164242320
 **/
let {sequelize, Sequelize, db_prefix} = require('./../lib/Db');
let account_model = require('./model_account');

//create service class
class Services extends Sequelize.Model {
}

//service objects
Services.init({
    s_id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    s_title: {type: Sequelize.STRING, allowNull: false},
    s_desc: {type: Sequelize.STRING(1024), allowNull: false},
    s_cost: {type: Sequelize.STRING, allowNull: false},
    s_status: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},
}, {sequelize, modelName: db_prefix + "services"});

//create module class
class UServices extends Sequelize.Model {
}

UServices.init({
    us_id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    us_user: {type: Sequelize.INTEGER, allowNull: false},
    us_enabled: {type: Sequelize.BOOLEAN, allowNull: false},
    us_identity: {type: Sequelize.STRING, allowNull: false, unique: true},
    us_title: {type: Sequelize.STRING, allowNull: false, defaultValue: 'Service Title'},
    us_desc: {type: Sequelize.STRING(1024), allowNull: false, defaultValue: 'Service Descriptions'},
    us_email: {type: Sequelize.STRING, allowNull: false, defaultValue: 'service@churcha2z.com', unique: true},
    us_phone: {type: Sequelize.STRING, allowNull: false, defaultValue: '08012345678'},
    us_country: {type: Sequelize.STRING, allowNull: true},
    us_state: {type: Sequelize.STRING, allowNull: true},
    us_address: {type: Sequelize.STRING, allowNull: false, defaultValue: 'Service physical address'},
    us_size: {type: Sequelize.STRING, allowNull: false, defaultValue: '100-500'},
    us_activity_count: {type: Sequelize.STRING, allowNull: false, defaultValue: '1'},
    us_logo: {type: Sequelize.STRING(500), allowNull: false, defaultValue: "https://via.placeholder.com/250x250.png/dde3f0/?text=CA2Z%20Logo"},
    us_password: {type: Sequelize.STRING(500), allowNull: true},
}, {sequelize, modelName: db_prefix + "uservices"});

Services.hasMany(UServices, {foreignKey: 's_id', as: 'services_sales'});
UServices.belongsTo(Services, {foreignKey: 's_id', targetKey: 's_id', as: "services"});

sequelize.sync();

module.exports = {Services, UServices};
