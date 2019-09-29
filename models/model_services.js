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

//create module class
class UServices extends Sequelize.Model {
}

//Pastors class
class UPastors extends Sequelize.Model {

}

//create locations table
class ULocations extends Sequelize.Model {
}

//service objects table
Services.init({
    s_id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    s_title: {type: Sequelize.STRING, allowNull: false},
    s_desc: {type: Sequelize.STRING(1024), allowNull: false},
    s_cost: {type: Sequelize.STRING, allowNull: false},
    s_status: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},
}, {sequelize, modelName: db_prefix + "services"});
//user services table
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
    us_logo: {
        type: Sequelize.STRING(500),
        allowNull: false,
        defaultValue: "https://via.placeholder.com/250x250.png/dde3f0/?text=CA2Z%20Logo"
    },
    us_password: {type: Sequelize.STRING(500), allowNull: true},
}, {sequelize, modelName: db_prefix + "uservices"});
//Pastors tables
UPastors.init({
    p_id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    p_sname: {type: Sequelize.STRING, allowNull: true},
    p_oname: {type: Sequelize.STRING, allowNull: true},
    p_date_of_intake: {type: Sequelize.STRING, allowNull: true},
    p_date_of_confirm: {type: Sequelize.STRING, allowNull: true},
    p_email: {type: Sequelize.STRING, allowNull: false, unique: true},
    p_phone1: {type: Sequelize.STRING, allowNull: true},
    p_phone2: {type: Sequelize.STRING, allowNull: true},
    p_dob: {type: Sequelize.STRING, allowNull: true},
    p_sex: {type: Sequelize.STRING, allowNull: true},
    p_marital: {type: Sequelize.STRING, allowNull: true},
    p_date_of_marriage: {type: Sequelize.STRING, allowNull: true},
    p_state_of_origin: {type: Sequelize.STRING, allowNull: true},
    p_lgea: {type: Sequelize.STRING, allowNull: true},
    p_pastorial_status: {type: Sequelize.STRING, allowNull: true},
    p_engagement_status: {type: Sequelize.STRING, allowNull: true},
    p_residential_address: {type: Sequelize.STRING, allowNull: true},
}, {sequelize, modelName: db_prefix + "upastors"});
//locations tables
ULocations.init({
    l_id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    l_current_digc_location: {type: Sequelize.STRING, allowNull: true},
    l_date_planted: {type: Sequelize.STRING, allowNull: true},
    l_mother_church: {type: Sequelize.STRING, allowNull: true},
    l_presiding_pst_mc: {type: Sequelize.STRING, allowNull: true},
    l_first_pioneer_res_pst: {type: Sequelize.STRING, allowNull: true},
    l_full_address: {type: Sequelize.STRING, allowNull: true},
    l_state: {type: Sequelize.STRING, allowNull: true},
    l_email: {type: Sequelize.STRING, allowNull: true},
    l_phone_number: {type: Sequelize.STRING, allowNull: true},
    l_password: {type: Sequelize.STRING, allowNull: true},
    l_token: {type: Sequelize.STRING, allowNull: true},
    l_enabled: {type: Sequelize.BOOLEAN, defaultValue: true},
}, {sequelize, modelName: db_prefix + "ulocations"});

//do table binding and linking
Services.hasMany(UServices, {foreignKey: 's_id', as: 'services_sales'});
UServices.belongsTo(Services, {foreignKey: 's_id', targetKey: 's_id', as: "services"});
UPastors.belongsTo(UServices, {foreignKey: 'us_id', targetKey: 'us_id', as: "uservices"});
ULocations.belongsTo(UPastors, {foreignKey: 'p_id', targetKey: 'p_id', as: "upastor"});
ULocations.belongsTo(UServices, {foreignKey: 'us_id', targetKey: 'us_id', as: "uservices"});

sequelize.sync();

module.exports = {Services, UServices, UPastors, ULocations};
