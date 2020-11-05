const mysql = require('mysql2');
const settings = require('./settings.js');



//disconnection Handling
//10~20초 사이마다 새로운 쿼리가 없을 시 disconnect 된다.
module.exports = function handleDisconnect() {
    const dbConnection = mysql.createConnection(settings);
    dbConnection.connect(function(error){
        if (error) {
            console.error(error.message);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log("MySQL Database is Connected!");
        }
    });
    dbConnection.on('error', function(error) {
        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw error;
        }
    });

    return dbConnection;
}


