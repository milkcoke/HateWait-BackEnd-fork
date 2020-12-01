const express = require('express');
const router = express.Router();
const getPoolConnection = require('../db/dbConnection');
const bcrypt = require('bcrypt');
const bcryptConfig = require('../config/bcrypt_setting');
const checkId = require('../function/check_id');
const checkPhone = require('../function/check_phone');
const locationUrl = require('../config/url_setting');

//id 중복체크 (member / store)
router.get('/members/id/:id', (request, response) => {
    if (!request.params.hasOwnProperty('id')) {
        //id key 를 갖지 않은경우
        return response.status(400).json({
            message: "아이디를 입력해주세요!"
        });
    } else {
        checkId.member(request.params.id)
            .then(resultId=>{
                // 쿼리 결과상 나오지 않은 사용 가능한 아이디.
                if(resultId === null) {
                    return response.status(200).json({
                        message : "사용 가능한 아이디입니다."
                    });
                } else {
                    //쿼리 결과가 존재하는 이미 가입된 아이디.
                    return response.status(409).json({
                        message : "이미 가입된 아이디입니다."
                    });
                }
            })
            .catch(error=>{
                console.error(error.message);
                return response.status(500).json({
                    message: "서버 내부 오류입니다. 다시 요청해주세요."
                });
            });
    }
});


router.get('/stores/id/:id', (request, response) => {
    if (!request.params.hasOwnProperty('id')) {
        return response.status(400).json({
            message: "아이디를 입력해주세요!"
        });
    } else {
        checkId.store(request.params.id)
            .then(resultId=>{
                if(resultId === null) {
                    return response.status(200).json({
                        message : "사용 가능한 아이디입니다."
                    });
                } else {
                    return response.status(409).json({
                        message : "이미 가입된 아이디입니다."
                    });
                }
            })
            .catch(error=>{
                console.error(error.message);
                return response.status(500).json({
                    message: "서버 내부 오류입니다. 다시 요청해주세요."
                });
            });
    }
});

// 전화번호 중복체크 (member/store)
router.get('/members/phone/:phone', (request, response) => {
    if (!request.params.hasOwnProperty('phone')) {
        return response.status(400).json({
            message: "전화번호를 입력해주세요!"
        });
    } else {
        console.log(`phone : ${request.params.phone}`);
        checkPhone.member(request.params.phone)
            .then(requestPhone=>{
                if(requestPhone === null) {
                    return response.status(200).json({
                        message : "사용 가능한 전화번호입니다."
                    });
                } else {
                    return response.status(409).json({
                        message : "이미 사용중인 전화번호입니다."
                    });
                }
            })
            .catch(error=>{
                console.error(error.message);
                return response.status(500).json({
                    message: "서버 내부 오류입니다. 다시 요청해주세요."
                });
            });
    }
});


router.get('/stores/phone/:phone', (request, response) => {
    if (!request.params.hasOwnProperty('phone')) {
        return response.status(400).json({
            message: "전화번호를 입력해주세요!"
        });
    } else {
        checkPhone.store(request.params.phone)
            .then(requestPhone=>{
                if(requestPhone === null) {
                    return response.status(200).json({
                        message : "사용 가능한 전화번호입니다."
                    });
                } else {
                    return response.status(409).json({
                        message : "이미 사용중인 전화번호입니다."
                    });
                }
            })
            .catch(error=>{
                console.error(error.message);
                return response.status(500).json({
                    message: "서버 내부 오류입니다. 다시 요청해주세요."
                });
            });
    }
});


router.post('/member', (request, response) => {
    const memberInfo = request.body

    console.log('==========================');

    //Response Code 409 Conflict
    // This code is used in situations where the user might be able to resolve the conflict and resubmit the request.
    //클라이언트의 요청이 서버의 상태와 충돌이 발생한 경우 (400~405 Code 에 해당하지 않는 애매한 경우에도 사용)
    if (!memberInfo.id || !memberInfo.name || !memberInfo.phone
        || !memberInfo.email || !memberInfo.pw) {
        return response.status(409).json({
            message : "입력하지 않은 항목이 있어요 다시 시도해주세요"
        });
    }

    //    비밀번호 암호화
    bcryptConfig.SALT.then(SALT=> {
        return bcrypt.hash(memberInfo.pw, SALT);
    }).then(hashedPassword => {
        memberInfo.pw = hashedPassword;
        // 암호화된 비밀번호와 함께 DB에 가게 회원 정보 삽입.
        // const register_member_sql = 'INSERT INTO member SET ?';
        const register_member_sql = `INSERT INTO member VALUES (?, ?, ?, ?, 0, ?)`;
        getPoolConnection(connection=>{
            connection.execute(register_member_sql, [memberInfo.id, memberInfo.name, memberInfo.phone, memberInfo.email, memberInfo.pw], (error, result)=>{
                connection.release();
                if(error) {
                    if (error.code === 'ER_DUP_ENTRY') {
                        console.error(error.message);
                        return response.status(409).json({
                            message : "이미 가입된 손님입니다."
                        });
                    } else {
                        console.error(error);
                        return response.status(500).json({
                            message : "내부 서버 오류입니다."
                        });
                    }
                } else if (!result) {
                    return response.status(500).json({
                        message : 'DB 회원정보 삽입 오류입니다.'
                    });
                } else {
                    // Just send the absolute path.
                    // location : 생성된 resource (회원정보) 를 어디서 확인할 수 있는지 확인할 수 있는 URL
                    // 이 때 location URL 은 반드시 절대경로여야한다.
                    // Reference : https://tools.ietf.org/html/rfc7231#section-7.1.2
                    return response.status(201)
                        .location(locationUrl.memberURL + memberInfo.id)
                        .json({
                            message : '회원가입 완료!',
                            name : memberInfo.name
                        });
                }
            });
            //return the poolConnection to Pool
        });
    })
    .catch((error) => {
    console.error(error);
    return response.status(500).json({
        message : "서버의 비밀번호 암호화 오류입니다."
        });
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

//    비밀번호 암호화
    bcryptConfig.SALT.then(SALT=> {
        return bcrypt.hash(storeInfo.pw, SALT);
    }).then(hashedPassword => {
        storeInfo.pw = hashedPassword;
        // 암호화된 비밀번호와 함께 DB에 가게 회원 정보 삽입.
        const register_store_sql = `INSERT INTO store VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)`;
        getPoolConnection(connection=>{
            connection.execute(register_store_sql, [storeInfo.id, storeInfo.name, storeInfo.phone, storeInfo.email, storeInfo.info, storeInfo.business_hour, storeInfo.maximum_capacity, storeInfo.address, storeInfo.pw], (error, result)=>{
                    connection.release();
                    if(error) {
                        console.error(error);
                        return response.status(500).json({
                            message : "서버 내부 오류입니다."
                        });
                    } else if (!result) {
                        console.log(result);
                        return response.status(500).json({
                            message : 'DB 가게정보 삽입 오류입니다.'
                        });
                    } else {
                        return response.status(201)
                            .location(locationUrl.storeURL + storeInfo.id)
                            .json({
                                message : '회원가입 완료!',
                                name : storeInfo.name
                            });
                    }
                });
            });
        })
        .catch(error => {
            console.error(error);
            return response.status(500).json({
                message : "비밀번호 암호화 오류입니다."
            })
        });
});


module.exports = router;