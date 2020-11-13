const getPoolConnection = require('../db/db');

//async-await is not appropriate without parameter 'callback function'
//so use Promise object.
function checkStoreId(storeId) {
    const sql = 'SELECT id FROM store WHERE id=?';
    return new Promise((resolve, reject) => {
        getPoolConnection(connection=>{
            connection.execute(sql, [storeId], (error, rows) => {
                connection.release();
                if (error) {
                    console.error(error);
                    reject(error);
                } else if (rows.length === 0) {
                    resolve(null);
                } else {
                    resolve(rows[0].id);
                }
            });
        });
    });
}

function checkMemberId(memberId) {
    const sql = 'SELECT id FROM member WHERE id=?';
    return new Promise((resolve, reject) => {
        getPoolConnection(connection=>{
            connection.execute(sql, [memberId], (error, rows)=> {
                connection.release();
                if(error) {
                    reject(error);
                }else if (rows.length === 0){
                    resolve(null);
                } else {
                    resolve(rows[0].id);
                }
            });
        });
    });
}

module.exports = {
    member: checkMemberId,
    store : checkStoreId
}