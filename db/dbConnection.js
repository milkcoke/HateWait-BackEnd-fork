const mysql = require('mysql2');
const settings = require('./settings.js');

const connectionPool = mysql.createPool(settings);

module.exports = function getConnection(callback) {
    connectionPool.getConnection((error, connection)=> {
        if (error) {
            connection.release();
            console.log('DB Pool Connection Failed!');
            console.error(error);
        } else {
            callback(connection);
        }
    });
}
