const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const getPoolConnection = require('../db/db2');
const passport = require('../config/passport');

router.get('/', (request, response)=> {
    //확인용
    const reLoginFlash = request.flash();
    console.log(reLoginFlash);
    console.error(reLoginFlash.error[0]);

    if (reLoginFlash.error) {
       return response.json({
           message : reLoginFlash.error[0]
       })
    } else {
        return response.json({
            message : '로그인에 실패하셨군요, 재로그인 페이지입니다.'
        })
    }
});

// Local authentication
// 로그인 실패시 로그인 화면으로 이동.
// failureFlash: passport 가 strategy verify callbac k에 의해 정의된 에러 메시지를 flash 하게 하는 옵션.
// 오류의 원인을 출력해줄 수 있게한다.
router.post('/members', passport.authenticate('local-login', {successRedirect : '/success', failureRedirect : '/login', failureFlash : true}),
    function(request, response) {
    //로그인 이후 메인 페이지로 이동.
        console.log('??에에에엥');
    return response.json({
        message : 'login-trying is completed!'});
    });

router.post('/members/test', (request, response) => {
    const memberInfo = request.body;
    console.log('=================');
    if(!memberInfo.id || !memberInfo.pw) {
        return response.status(409).json({
            message : "아이디 비밀번호중 입력하지 않은게 있는데 어찌 시도하셨나요?"
        });
    }

    const password_sql = 'SELECT name, pw FROM member where id=?';
    getPoolConnection(connection=>{
        connection.execute(password_sql, [memberInfo.id],(error, rows)=> {
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
                bcrypt.compare(memberInfo.pw, rows[0].pw)
                    .then(result => {
                        //compare method return true/false
                        if(result) {
                            return response.status(200).json({
                                message : "로그인 성공!",
                                member : rows[0].name
                            });
                        } else {
                            return response.status(409).json({
                                message : "비밀번호가 옳지 않아요"
                            })
                        }

                    })
                    .catch(error => {
                        return response.status(500).json({
                            message : "비밀번호 암호화 오류"
                        })
                    });
            }
        });
        connection.release();
    });

});


// json request test용
router.post('/stores/test', (request, response) => {
        const storeInfo = request.body;
        console.log('store request start! ================');
        for(let form in storeInfo.accessKey) {
            console.log(form.valueOf());
        }
        if(!storeInfo.id || !storeInfo.pw) {
            return response.status(409).json({
                message : "아이디 비밀번호중 입력하지 않은게 있는데 어찌 시도하셨나요?"
            });
        }

    const password_sql = 'SELECT name, pw FROM store where id=?';
    getPoolConnection(connection=>{
        connection.execute(password_sql, [storeInfo.id], (error, rows)=> {
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
                bcrypt.compare(storeInfo.pw, rows[0].pw)
                    .then(result => {
                        if(result) {
                            return response.status(200).json({
                                message : "로그인 성공!",
                                storeName : rows[0].name,
                            });
                        } else {
                            return response.status(409).json({
                                message : "비밀번호가 옳지 않아요"
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
        connection.release();
    });
});

// authentication 함수 원형 :Authenticator.prototype.authenticate = function(strategy, options, callback)
router.post('/stores', passport.authenticate('local-login',
    {successRedirect : '/', failureRedirect : '/login', failureFlash : true}),
    function(request, response) {
        //로그인 이후 메인 페이지로 이동.
        return response.json({
            message : 'login-trying is completed!'
        });
    });


router.get('/success', (request, response) => {
    return response.json({
        "message" : "로그인 성공!"
    })
})

module.exports = router;
