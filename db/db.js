const mysql = require('mysql2');
const settings = require('./settings.js');



//dissconnectiion Handling
//10~20초 사이마다 새로운 쿼리가 없을 시 disconnect된다.

module.exports = function handleDisconnect() {
    const dbConnection = mysql.createConnection(settings);
    dbConnection.connect(function(err){
        if (err) {
            throw err;
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log("MySQL Database is Connected!");
        }
    });

    dbConnection.on('error', function(err) {
        // console.error('Database Error :', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });

    return dbConnection;
}


