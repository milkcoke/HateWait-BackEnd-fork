const jwt = require('jsonwebtoken');
const passport = require('passport');
const fs = require('fs');
const path = require('path');

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
            request.login(store, {session: false}, error=>{
                if (error) {
                    console.error(error);
                    response.status(500).json({
                        message: "서버 내부 오류입니다."
                    });
                }
                const accessToken = jwt.sign({id: store.id}, fs.readFileSync(path.join(__dirname, '..','config', 'id_rsa_private.pem')), {expiresIn: '1h'});
                console.log(`accessToken : ${accessToken}`);

                return response.status(200).json({
                    accessToken : accessToken
                })
            });
        }
    })(request, response);
}