const express = require('express');
const router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('../config/bcrypt_setting');
const dbConnection = require('../db/db');
// 삭제 예정 2줄
const passport = require('../config/passport');

router.post('/', (request, response)=> {
    const reLoginFlash = request.flash();
    console.log(reLoginFlash);
    console.error(reLoginFlash.error);

    if (reLoginFlash.error) {
       return response.json({
           message : reLoginFlash.error
       })
    } else {
        return response.json({
            message : '재로그인 페이지입니다.'
        })
    }
});

// Local authentication
// 로그인 실패시 로그인 화면으로 이동.
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
    dbConnection().execute(password_sql, [memberInfo.id], (error, row)=> {
        if (error) {
            response.status(500).json({
                message : "서버 오류에요"
            });
        } else if (!row[0]) {
            return response.status(409).json({
                message : "해당 사용자가 존재하지 않습니다."
            });
        } else {
            bcrypt.bcrypt.compare(memberInfo.pw, row[0].pw)
                .then(result => {
                    return response.status(200).json({
                        message : "로그인 성공!",
                        member : row[0].name
                    });
                })
                .catch(error => {
                    return response.status(409).json({
                        message : "비밀번호가 옳지 않아요"
                    })
                });
        }
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
    dbConnection().execute(password_sql, [storeInfo.id], (error, rows)=> {
        if (error) {
            response.status(500).json({
                message : "서버 오류에요"
            });
        } else if (!rows[0]) {
            return response.status(409).json({
                message : "해당 사용자가 존재하지 않습니다."
            });
        } else {
            bcrypt.bcrypt.compare(storeInfo.pw, rows[0].pw)
                .then(result => {
                    if(result) {
                        return response.status(200).json({
                            message : "로그인 성공!",
                            storeName : rows[0].name
                        });
                    } else {
                        return response.status(409).json({
                            message : "비밀번호가 옳지 않아요"
                        })
                    }
                })
                .catch(error => {
                    return response.status(500).json({
                        message: "서버 오류입니다. 개발자놈 예끼이놈"
                    })
                });
        }
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

// failureFlash: passport가 strategy verify callback에 의해 정의된 에러 메시지를 flash하게 하는 옵션.
// 오류의 원인을 출력해줄 수 있게한다.

module.exports = router;
