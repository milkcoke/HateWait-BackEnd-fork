const fs = require('fs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const path = require('path');
const storeModel = require('../models').store;

module.exports = function authenticationToken(request, response, next){
    passport.authenticate('jwt', {session: false}, (error, store)=>{

        //    verify the accessToken
        //    token comes from the header
        //    object key name is auto transformed from Upper case to lower case
        // const authorizationHeader = request.cookies['authorization'];
        const authorizationCookie = request.cookies['jwt'];
        // const token = authorizationHeader && authorizationHeader.split(' ')[1];
        const accessToken = authorizationCookie && authorizationCookie.split(' ')[1];
        //if there is no token stored in cookies, the request is unauthorized
        if(!accessToken) return response.sendStatus(400);

        //클라이언트 단에서 만료시간 지나면 토큰 재발급 요청하는게 더 나음.
        //일단 편의를 위해 서버단에서 토큰 만료시 자동 재발급 요청 로직 추가

        //verify 할때는 algorithms : array 이고
        jwt.verify(accessToken, fs.readFileSync(path.join(__dirname, '..','config', 'id_rsa_public.pem'), 'utf8'),{algorithms: ['RS256']}, (error, store)=>{
            if(error) {
                if(error.name === 'TokenExpiredError'){
                    console.log(`expiredDate: ${error.expiredAt}`);
                    storeModel.findOne({
                        where: store.id
                    }).then(targetStore => {
                        if(!targetStore.refresh_token) return response.status(403).json({message: "Don't try to hack"});
                        const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '..','config', 'id_rsa_public_refresh.pem'), 'utf8');
                        const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '..','config', 'id_rsa_private_refresh.pem'), 'utf8');

                        jwt.verify(targetStore.refresh_token, PUBLIC_KEY, {algorithms: ['RS512']}, (error, dbStore)=>{
                            if(!store.id === dbStore.id) return response.status(403).json({message: "You are not trying to right token request"});
                            const newAccessToken = jwt.sign({id: store.id}, PRIVATE_KEY, {expiresIn: '15s', algorithm: 'RS256'});
                            const newRefreshToken = jwt.sign({id: store.id}, PRIVATE_KEY, {expiresIn: '30d', algorithm: 'RS512'});
                            targetStore.upsert({
                                refresh_token: newRefreshToken
                            }).then(result => {
                                response.cookie('jwt', newAccessToken, {secure: false, httpOnly: true});
                                request.store = dbStore;
                                console.log(`refresh token result : ${result}, refreshToken updated!`);
                            }).catch(error=>{
                                console.error(error);
                            });
                        });
                    })
                    return response.status(403).json({message : "your token is no longer valid"});
                } else {
                    console.error(error);
                    return response.status(400).json({message: "bad token request"});
                }
            } else {
                //request.user = store;
                request.store = store;
                next();
            }
        });
    })(request, response);
}