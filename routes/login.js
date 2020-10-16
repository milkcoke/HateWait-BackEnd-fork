const express = require('express');
const router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
const passport = require('../config/passport');
const passportJwt = require('../config/passport_jwt');

// Local authentication
// 로그인 실패시 로그인 화면으로 이동.
router.post('/members', passport.authenticate('local-login', {successRedirect : '/success', failureRedirect : '/login', failureFlash : true}),
    function(request, response) {
    //로그인 이후 메인 페이지로 이동.
        console.log('??에에에엥');
    response.json({
        message : 'login-trying is completed!'});
    });

// authentication 함수 원형 :Authenticator.prototype.authenticate = function(strategy, options, callback)
router.post('/stores', passport.authenticate('local-login', {successRedirect : '/success', failureRedirect : '/login', failureFlash : true}),
    function(request, response) {
        //로그인 이후 메인 페이지로 이동.
        response.json({
            message : 'login-trying is completed!'});
    });

router.post('/stores-jwt', (request, response) => {
        passportJwt.authenticate('jwt', {session: false}, (error, store)=> {
        if (error || !store) {
            return response.status(400).json({
                message : 'your token is unauthorized',
                store : store
            });
        } else {
            request.login(store, {session: false}, (error) => {
                if (error) response.send(error);
            })
            //token 인증
            const token = jsonwebtoken.sign(store.toJSON(), 'secret');
            return response.json({store, token});
            console.log(store);
        }
    })
});


// router.post('/stores-jwt', passportJwt.authenticate('jwt', {session: false}, (error, store)=> {
//         if (error) throw error;
//         else console.log(store);
//     }),
//     (request, response) => {
//         response.json(request.store)
//     });


// router.post('/stores-jwt',
//     passportJwt.authenticate('jwt',
//     {successRedirect : '/success', failureRedirect : '/login', failureFlash : true},
//     (error, store) => {
//         if (error) throw error;
//         else {
//             //여기 수정 필요 id 받아서 jsonwebtoken 만들어줘야함.
//             jsonwebtoken.sign({store}, 'secret');
//             console.log('After authentication return store info : ' + store);
//         }
//     //    request.store = store;
//     }),
//     function(request, response) {
//         //로그인 이후 메인 페이지로 이동.
//         response.json({
//             store
//         });
//     });

router.get('/success', (request, response) => {
    response.json()
})

// failureFlash: passport가 strategy verify callback에 의해 정의된 에러 메시지를 flash하게 하는 옵션.
// 오류의 원인을 출력해줄 수 있게한다.

module.exports = router;
