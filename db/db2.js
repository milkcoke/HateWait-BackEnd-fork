const mysql = require('mysql2');
const settings = require('./settings.js');


module.exports = function handleDisconnect() {
    const connection = mysql.createConnection(settings);
    connection.connect(function(err){
        if (err) {
            throw err;
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log("MySQL Database is Connected!");
        }
    });

    connection.on('error', function(err) {
        console.error('Database Error :', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });

    return connection;
}


