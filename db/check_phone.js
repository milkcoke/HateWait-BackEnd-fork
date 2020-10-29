const dbConnection = require('./db');

function checkMemberPhone(memberPhone) {
    const sql = 'SELECT phone FROM member WHERE id=?';
    return new Promise((resolve, reject) => {
        dbConnection().execute(sql, [memberPhone], (error, rows)=> {
            if(error) reject(error);
            else {
                if (rows.length === 0) {
                    resolve(null);
                } else {
                    resolve(rows[0].phone);
                }
            }
        });
    });
}


function checkStorePhone(storePhone) {
    const sql = 'SELECT phone FROM store WHERE phone=?';
    return new Promise((resolve, reject) => {
        dbConnection().execute(sql, [storePhone], (error, rows) => {
            if(error) reject(error);
            else {
                if(rows.length === 0) {
                    resolve(null);
                } else {
                    resolve(rows[0].phone);
                }
            }
        });;
    });
}



module.exports = {
    member: checkMemberPhone,
    store : checkStorePhone
}