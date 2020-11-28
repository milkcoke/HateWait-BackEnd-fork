const jwt = require('jsonwebtoken');
const passport = require('passport');
const fs = require('fs');
const path = require('path');
const storeModel = require('../models').store;

module.exports = function authenticate(request, response, next) {
    passport.authenticate('local', {session: false}, (error, store)=>{
        if(error) {
            return response.status(500).json({
            message : "서버 내부 오류입니다."
            });
        } else if(!store) {
            return response.status(409).json({
                message: "헤잇웨잇에 가입된 가게 아이디가 아닙니다."
            });
        } else {
            //login은 대체 어디서 튀어나왔냐 ㅋㅋㅋ 아 ㅋㅋㅋ
            request.login(store, {session: false}, error=>{
                if (error) {
                    console.error(error);
                    return response.status(500).json({
                        message: "서버 내부 오류입니다."
                    });
                }
                //sign 할때는 algorithm ㅋㅋㅋㅋ 골때린다 진짜하 ㅋㅋㅋㅋ
                // 오로지 id 만을 담음.
                const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '..','config', 'id_rsa_private.pem'), 'utf8');

                const accessToken = jwt.sign({id: store.id}, PRIVATE_KEY, {expiresIn: '15s', algorithm: 'RS256'});

                //보통의 경우 refresh token 은 database 에 담음
                const refreshToken = jwt.sign({id: store.id}, PRIVATE_KEY, {expiresIn: '30d', algorithm: 'RS512'});
                console.log(`refreshToken : ${refreshToken}`);

                store.upsert({
                    refresh_token: refreshToken
                }).then(result => {
                    console.log(`upsertResult : ${result}`);
                }).catch(error=>{
                    console.error(`${error} refresh token update error`);
                });

                response.cookie('jwt', accessToken, {secure: false, httpOnly: true});
                return response.status(200).json({
                    accessToken : accessToken
                });

            });
        }
    })(request, response);
}