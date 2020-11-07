const getPoolConnection = require('./db2');

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
// async function checkStoreId(storeId) {
//     const sql = 'SELECT id FROM store WHERE id=?';
//     let result = null;
//     // 나 이거왜 리턴안하는지 알았다.
//     // callback 함수 내에서 리턴한거라서그럼. -> Promise 로 바꿀 수 도 있음.
//     await dbConnection().execute(sql, [storeId], await function (error, rows) {
//         if(error) {
//             // result = error;
//             throw error;
//         } else if (rows.length === 0) {
//             // result = null;
//             result = null;
//         } else {
//             // result = rows[0].id;
//             result = storeId;
//         }
//     });
//     console.log(`result: ${result}`);
//     return result;
//
// }

// async function checkMemberId(memberId) {
//     const sql = 'SELECT id FROM member WHERE id=?';
//     let result = null;
//     await dbConnection().execute(sql, [memberId], await function(error, rows) {
//         if(error) {
//             // result = error;
//             throw error;
//         } else if(rows.length === 0) {
//             console.log(rows);
//             console.log(rows.length);
//             result = null;
//         } else {
//             result = memberId;
//         }
//     });
//     console.log(`result: ${result}`);
//     return result;
// }

module.exports = {
    member: checkMemberId,
    store : checkStoreId
}