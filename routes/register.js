const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');
const bcrypt = require('../config/bcrypt_setting');

router.post('/store', (request, response) => {

    let storeInfo = request.body
//    null, "" 공백값 check
    console.log('========================');

    if (!storeInfo.id || !storeInfo.name || !storeInfo.phone || !storeInfo.email
        || !storeInfo.maximum_capacity || !storeInfo.address || !storeInfo.pw) {
        return response.json({
            message : "입력하지 않은 항목이 있어요 다시 시도해주세요"
        });
    }
//    id 중복성 검사
    const check_id_sql = 'SELECT id FROM store WHERE id=?';
    dbConnection().query(check_id_sql, [storeInfo.id], (error, row) => {
        if (error) response.send(error);
        else if (!row) {
            return response.json({
                message : '이미 존재하는 ID입니다.'
            });
        }
    });
//    phone 중복성 검사
    const check_phone_sql = 'SELECT phone FROM store WHERE phone=?';
    dbConnection().query(check_phone_sql, [storeInfo.phone], (error, row) => {
        if (error) response.send(error);
        else if (!row) {
            return response.json({
                message : '이미 가입된 전화번호입니다.'
            })
        }
    });

    // if (error) response.status(500).json({
    //     message : "비밀번호 암호화 오류"
    // }) else {
    //     //평문 패스워드 암호화된 패스워드로 대치.
    //     storeInfo.password = hashedPassword;
    // }
//    비밀번호 암호화
    bcrypt.bcrypt.hash(storeInfo.pw, bcrypt.SALT)
        .then(hashedPassword => {
            storeInfo.pw = hashedPassword;

            // 암호화된 비밀번호와 함께 DB에 가게 회원 정보 삽입.
            const register_store_sql = 'INSERT INT store VALUES(?,?,?,?,?,?,?,?,?)';
            dbConnection().query(register_store_sql, [storeInfo], (error, result)=> {
                if (error) console.error(error);
                else if (!result) {
                    return response.json({
                    message : 'DB 가게정보 삽입 오류입니다.'
                    });
                } else {
                    return response.json({
                        message : '회원가입 완료!'
                    });
                }
            })
        })
        .catch(error => {
            return response.status(500).json({
                    message : "비밀번호 암호화 오류입니다."
            })});

});


module.exports = router;