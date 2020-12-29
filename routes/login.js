const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const getPoolConnection = require('../db/dbConnection');

const localAuthenticate = require('../function/local_authentication_middleware');
const jwtAuthenticate = require('../function/jwt_authentication_middleware');


router.post('/members', (request, response, next)=>{
    // 계정 유형 : member / store
    request.userType = 'member';
    next();
}, localAuthenticate);

router.get('/member', (request, response, next)=>{
    request.userType = 'member';
    next();
}, jwtAuthenticate);

router.post('/members/test', (request, response) => {
    const {id, pw} = request.body;
    console.log('store request start! ================');

    if(!id || !pw) {
        return response.status(400).json({
            message : "아이디 비밀번호중 입력하지 않은게 있는데 어찌 시도하셨나요?"
        });
    }

    //id 는 빼야함.
    const password_sql = 'SELECT id, name, phone, pw FROM member where id=?';
    getPoolConnection(connection=>{
        connection.execute(password_sql, [id],(error, rows)=> {
            connection.release();
            if (error) {
                console.error(error);
                response.status(500).json({
                    message : "서버 오류에요"
                });
            } else if (rows.length === 0) {
                return response.status(409).json({
                    message : "해당 사용자가 존재하지 않습니다."
                });
            } else {
                //비밀번호 값 대조, 로그인 시도
                bcrypt.compare(pw, rows[0].pw)
                    .then(result => {
                        //compare method return true/false
                        if(result) {
                            // 2nd id parameter 삭제 예정
                            return response.status(200).json({
                                message : "로그인 성공!",
                                id : rows[0].id,
                                name : rows[0].name,
                                phone : rows[0].phone
                            });
                        } else {
                            return response.status(409).json({
                                message : "비밀번호가 옳지 않아요"
                            })
                        }

                    })
                    .catch(error => {
                        console.error(error);
                        return response.status(500).json({
                            message : "비밀번호 암호화 오류"
                        })
                    });
            }
        });
    });

});


// json request test 용
router.post('/stores/test', (request, response) => {
        const {id, pw} = request.body;
        console.log('store request start! ================');

        if(!id || !pw) {
            return response.status(400).json({
                message : "아이디 비밀번호중 입력하지 않은게 있는데 어찌 시도하셨나요?"
            });
        }

    const password_sql = 'SELECT id, name, pw FROM store where id=?';
    getPoolConnection(connection=>{
        connection.execute(password_sql, [id], (error, rows)=> {
            connection.release();
            if (error) {
                console.error(error);
                response.status(500).json({
                    message : "서버 오류에요"
                });
            } else if (rows.length === 0) {
                return response.status(409).json({
                    message : "헤잇웨잇에 가입된 아이디가 아닙니다."
                });
            } else {
                bcrypt.compare(pw, rows[0].pw)
                    .then(result => {
                        if(result) {
                            return response.status(200).json({
                                message : "로그인 성공!",
                                id : rows[0].id,
                                name : rows[0].name
                            });
                        } else {
                            return response.status(409).json({
                                message : "비밀번호를 확인해주세요"
                            });
                        }
                    })
                    .catch(error => {
                        console.error(error);
                        return response.status(500).json({
                            message: "서버 오류입니다. 개발자놈 예끼이놈"
                        });
                    });
            }
        });
    });
});

// authentication 함수 원형 :Authenticator.prototype.authenticate = function(strategy, options, callback)
router.post('/stores', (request, response, next)=>{
   request.userType = 'store';
   next();
}, localAuthenticate);

router.get('/store', (request, response, next)=>{
    request.userType = 'store';
    next();
}, jwtAuthenticate);


module.exports = router;
