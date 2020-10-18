const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');
const bcrypt = require('../config/bcrypt_setting');

router.post('/member', (request, response) => {
    const memberInfo = request.body

    console.log('==========================');

    //Response Code 409 Conflict :This code is used in situations where the user might be able to resolve the conflict and resubmit the request.

    if (!memberInfo.id || !memberInfo.name || !memberInfo.phone
        || !memberInfo.email || !memberInfo.pw) {
        return response.status(409).json({
            message : "입력하지 않은 항목이 있어요 다시 시도해주세요"
        });
    }
    // 중복 회원가입 방지
    const check_id_sql = 'SELECT id FROM member WHERE id=?';
    dbConnection().execute(check_id_sql, [memberInfo.id], (error) => {
        if(error) response.send(error);
        else {
            return response.status(409).json({
                message : '이미 존재하는 ID입니다.'
            });
        }
    });

    //    phone 중복성 검사
    const check_phone_sql = 'SELECT phone FROM member WHERE phone=?';
    dbConnection().execute(check_phone_sql, [memberInfo.phone], (error, row) => {
        if (error) response.send(error);
        else if (row) {
            return response.status(409).json({
                message : '이미 가입된 전화번호입니다.'
            })
        }
    });

    //    비밀번호 암호화
    bcrypt.SALT.then(SALT=> {
        return bcrypt.bcrypt.hash(memberInfo.pw, SALT);
    }).then(hashedPassword => {
        storeInfo.pw = hashedPassword;
        // 암호화된 비밀번호와 함께 DB에 가게 회원 정보 삽입.
        const register_store_sql = 'INSERT INTO member SET ?';
        dbConnection().execute(register_store_sql, [memberInfo], (error, result)=> {
            if (error) console.error(error);
            else if (!result) {
                return response.status(500).json({
                    message : 'DB 회원정보 삽입 오류입니다.'
                });
            } else {
                return response.status(200).json({
                    message : '회원가입 완료!',
                    memberName : memberInfo.name + "님 회원가입 축하해요!"
                });
            }
        })
    })
    .catch(error => {
    console.error(erorr);
    return response.status(500).json({
        message : "서버의 비밀번호 암호화 오류입니다."
        })
    });

});

router.post('/store', (request, response) => {

    const storeInfo = request.body
//    null, "" 공백값 check
    console.log('========================');

    if (!storeInfo.id || !storeInfo.name || !storeInfo.phone || !storeInfo.email
        || !storeInfo.maximum_capacity || !storeInfo.address || !storeInfo.pw) {
        return response.status(409).json({
            message : "입력하지 않은 항목이 있어요 다시 시도해주세요"
        });
    }
//    id 중복성 검사
    const check_id_sql = 'SELECT id FROM store WHERE id=?';
    dbConnection().execute(check_id_sql, [storeInfo.id], (error, row) => {
        if (error) response.send(error);
        else if (row) {
            return response.status(409).json({
                message : '이미 존재하는 ID입니다.'
            });
        }
    });
//    phone 중복성 검사
    const check_phone_sql = 'SELECT phone FROM store WHERE phone=?';
    dbConnection().execute(check_phone_sql, [storeInfo.phone], (error, row) => {
        if (error) response.send(error);
        else if (row) {
            return response.status(409).json({
                message : '이미 가입된 전화번호입니다.'
            })
        }
    });


//    비밀번호 암호화
    bcrypt.SALT.then(SALT=> {
        return bcrypt.bcrypt.hash(storeInfo.pw, SALT);
    }).then(hashedPassword => {
        storeInfo.pw = hashedPassword;
        // 암호화된 비밀번호와 함께 DB에 가게 회원 정보 삽입.
        const register_store_sql = 'INSERT INTO store SET ?';
        dbConnection().execute(register_store_sql, [storeInfo], (error, result)=> {
            if (error) console.error(error);
            else if (!result) {
                return response.status(500).json({
                message : 'DB 가게정보 삽입 오류입니다.'
                });
            } else {
                return response.status(200).json({
                    message : '회원가입 완료!',
                    storeName : storeInfo.name + "가게 가입을 축하해요!"
                });
            }
        })
    })
    .catch(error => {
        console.error(error);
        return response.status(500).json({
                message : "비밀번호 암호화 오류입니다."
        })});

});


module.exports = router;