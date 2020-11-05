// const dbConnection = require('./db');
const getPoolConnection = require('./db2');

function checkMemberPhone(memberPhone) {
    const sql = 'SELECT phone FROM member WHERE id=?';
    return new Promise((resolve, reject) => {
        getPoolConnection(connection=>{
            connection.execute(sql, [memberPhone], (error, rows)=> {
                if (error) {
                    reject(error);
                } else if (rows.length === 0) {
                    resolve(null);
                } else {
                    resolve(rows[0].phone);
                }
            });
            connection.release();
        });
    });
}


function checkStorePhone(storePhone) {
    const sql = 'SELECT phone FROM store WHERE phone=?';
    return new Promise((resolve, reject) => {
        getPoolConnection(connection=>{
            connection.execute(sql, [storePhone], (error, rows) => {
                if (error) reject(error);
                else {
                    if(rows.length === 0) {
                        resolve(null);
                    } else {
                        resolve(rows[0].phone);
                    }
                }
            });
            connection.release();
        })
    });
}



module.exports = {
    member: checkMemberPhone,
    store : checkStorePhone
}