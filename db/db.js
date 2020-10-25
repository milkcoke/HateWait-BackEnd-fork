const mysql = require('mysql2');
const settings = require('./settings.js');



//dissconnectiion Handling
//10~20초 사이마다 새로운 쿼리가 없을 시 disconnect된다.

module.exports = function handleDisconnect() {
    const dbConnection = mysql.createConnection(settings);
    dbConnection.connect(function(errror){
        if (errror) {
            console.error(errror.message);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log("MySQL Database is Connected!");
        }
    });
    dbConnection.on('error', function(errror) {
        // console.error('Database Error :', err);
        if (errror.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw errror;
        }
    });

    return dbConnection;
}


