const dbConnection = require('./db');


async function checkStoreId(storeId) {
    const sql = 'SELECT id FROM store WHERE id=?';
    let result = null;
    // 나 이거왜 리턴안하는지 알았다.
    // callback 함수 내에서 리턴한거라서그럼. -> Promise 로 바꿀 수 도 있음.
    await dbConnection().execute(sql, [storeId], (error, rows) => {
        if(error) {
            // result = error;
            throw error;
        } else if (rows.length === 0) {
            // result = null;
            result = null;
        } else {
            // result = rows[0].id;
            result = storeId;
        }
    });
    console.log(`result: ${result}`);
    return result;

}

async function checkMemberId(memberId) {
    const sql = 'SELECT id FROM member WHERE id=?';
    let result = null;
    await dbConnection().execute(sql, [memberId], (error, rows) => {
        if(error) {
            // result = error;
            throw error;
        } else if(rows.length === 0) {
            console.log(rows);
            console.log(rows.length);
            result = null;
        } else {
            result = memberId;
        }
    });
    console.log(`result: ${result}`);
    return result;
}

module.exports = {
    member: checkMemberId,
    store : checkStoreId
}