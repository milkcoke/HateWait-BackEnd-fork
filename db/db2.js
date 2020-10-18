const mysql = require('mysql2');
const settings = require('./settings.js');
const connection = mysql.createConnection(settings);


module.exports = connection;
