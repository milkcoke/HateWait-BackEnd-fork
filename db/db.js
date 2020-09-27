const mysql = require('mysql');
const settings = require('db/settings');

const dbConnection = mysql.createConnection(settings);

dbConnection.connect(function(err){
    if(err) throw err;
    console.log("MySQL Database is Connected!");
});

moudle.exports = dbConnection;