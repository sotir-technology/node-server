// Api SSK =
// sample data for church creations
// all response from server is using retrofit signature.
// {status: true, data: {}, msg: 'Any problem here'}

// status: must be true if what you r expecting is okay
// data: every data that you need from the server will be here. isArray when data is array, will be object if data is object. default []
// msg: check server reasons for false response

/*
    c_name: {type: STRING, allowNull: false},
    c_email: {type: STRING, allowNull: false, unique: true},
    c_phone: {type: STRING, allowNull: false},
    c_founder: {type: STRING, allowNull: false},
    c_password: {type: STRING, allowNull: false},
    c_country: {type: STRING, allowNull: false},
    c_state: {type: STRING, allowNull: false},
    c_street: {type: STRING, allowNull: false},
    c_role: {type: INTEGER, allowNull: false, defaultValue: 0},
    c_enable: {type: BOOLEAN, allowNull: false, defaultValue: 1},
    c_date: {type: DATE, defaultValue: NOW},
    c_token: {type: STRING, defaultValue: '', allowNull: false},
 */
//sever requirements
let church_data = {
    name: 'Church Name',
    email: 'church@church.com',
    phone: '08123456788/church phone',
    founder: 'Founder name',
    password: 'password (Pass normal string -non encoded)',
    country: 'Church Location/Country',
    state: 'Church Location/State',
    street: 'Church street/address',
};
