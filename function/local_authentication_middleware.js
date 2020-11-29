const jwt = require('jsonwebtoken');
const passport = require('passport');
const fs = require('fs');
const path = require('path');
const storeModel = require('../models').store;

module.exports = function authenticate(request, response, next) {
    passport.authenticate('local',{session: true}, (error, store, status)=>{
        // If authentication failed, user will be set to false.
        // If an exception occurred, err will be set.
        // An optional info argument will be passed, containing additional details provided by the strategy's verify callback.
        console.log(`error : ${error}`);
        console.log(`store : ${store}`);
        console.dir(status);

        if(error) {
            return response.status(500).json({
            message : "서버 내부 오류입니다."
            });
        } else if(!store) {
            //use request.login to establish session temporarily for use custom callback
                if(error) console.error(error);
                switch (status.code) {
                    case 400:
                        return response.status(status.code).json({message: "아이디를 입력해주세요"});
                    case 404:
                        return response.status(status.code).json({message: "헤잇웨잇에 가입된 가게가 아닙니다."});
                        break;
                    case 409:
                        return response.status(status.code).json({message: "비밀번호가 일치하지 않습니다."});
                        break;
                    default:
                        return response.status(status.code || 500).json({message: "여까지 왜왔누"});
                        break;
                }
        } else {
            // The callback can use the arguments supplied to handle the authentication result as desired.
            // Note that when using a custom callback,
            // it becomes the application's responsibility to establish a session (by calling req.login()) and send a response.

                //sign 할때는 algorithm ㅋㅋㅋㅋ 골때린다 진짜하 ㅋㅋㅋㅋ
                // 오로지 id 만을 담음.
                const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '..','config', 'id_rsa_private.pem'), 'utf8');

                const accessToken = jwt.sign({id: store.id}, PRIVATE_KEY, {expiresIn: '30s', algorithm: 'RS256'});

                //보통의 경우 refresh token 은 database 에 담음
                const refreshToken = jwt.sign({id: store.id}, PRIVATE_KEY, {expiresIn: '1d', algorithm: 'RS512'});
                console.log(`refreshToken : ${refreshToken}`);

                store.update({
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

        }
    })(request, response);
}