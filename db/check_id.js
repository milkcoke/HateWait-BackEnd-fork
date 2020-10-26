const dbConnection = require('./db');


async function checkStoreId(storeId) {
    const sql = 'SELECT id FROM store WHERE id=?';
    // let result = null;
    const result = await dbConnection().execute(sql, [storeId], (error, rows) => {
        if(error) {
            // result = error;
            throw error;
        } else if (rows.length === 0) {
            // result = null;
            return null;
        } else {
            // result = rows[0].id;
            return storeId;
        }
    });
    console.log(`result: ${result}`);
    return result;

}

async function checkMemberId(memberId) {
    const sql = 'SELECT id FROM member WHERE id=?';
    // let result = null;
    const result = await dbConnection().execute(sql, [memberId], (error, rows) => {
        if(error) {
            // result = error;
            throw error;
        } else if(rows.length === 0) {
            console.log(rows);
            console.log(rows.length);
            return null;
        } else {
            return memberId;
        }
    });
    console.log(`result: ${result}`);
    return result;
}

module.exports = {
    member: checkMemberId,
    store : checkStoreId
}