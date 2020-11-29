const fs = require('fs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const path = require('path');
const storeModel = require('../models').store;

module.exports = function authenticationToken(request, response, next){
    passport.authenticate('jwt', {session: false}, (error, store)=>{
        //여기서 false 가 나오는 이유? -> passport  jwt option : jwtFromRequest: fromAuthHeader
        // 우리는 지금 cookie 를 추출하고 있음.
        console.log(`targetStore : ${store}`);
        console.log('=======middleware return store model==========')
        console.dir(store);
        //    verify the accessToken
        //    token comes from the header
        //    object key name is auto transformed from Upper case to lower case
        // const authorizationHeader = request.cookies['authorization'];


        //if there is no token stored in cookies, the request is unauthorized
        // and passport jwt authenticate function return 'false' (that doesn't find id of jwt payload)
        if(!store) return response.status(403).json({message: "헤잇웨잇에 가입된 가게가 아닙니다."});

        //클라이언트 단에서 만료시간 지나면 토큰 재발급 요청하는게 더 나음.
        //일단 편의를 위해 서버단에서 토큰 만료시 자동 재발급 요청 로직 추가
        const accessToken = request.cookies['jwt'];

        //verify 할때는 algorithms : array 이고
        //default callback (1st: error, 2nd: payload of jwt)
        jwt.verify(accessToken, fs.readFileSync(path.join(__dirname, '..','config', 'id_rsa_public.pem'), 'utf8'),{algorithms: ['RS256']}, (error,targetStore)=>{
            if(error) {
                // 토큰 만기시 자동 refresh 요청 -> 재발급
                if(error.name === 'TokenExpiredError'){
                    console.log(`expiredDate: ${error.expiredAt}`);
                    console.log(`decoded target store payload: ${targetStore}`);
                    // refresh token 이 없는 경우 비정상적 요청으로 판단
                    if(!store.refresh_token) return response.status(403).json({message: "Don't try to hack"});

                    const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '..','config', 'id_rsa_public_refresh.pem'), 'utf8');
                    const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '..','config', 'id_rsa_private_refresh.pem'), 'utf8');

                    jwt.verify(store.refresh_token, PUBLIC_KEY, {algorithms: ['RS512']}, (error, payloadStore)=>{
                        console.log(`store refreshToken Payload: ${payloadStore}`);
                        if(store.id !== payloadStore.id) return response.status(403).json({message: "You are not trying to right token request"});
                        const newAccessToken = jwt.sign({id: store.id}, PRIVATE_KEY, {expiresIn: '30s', algorithm: 'RS256'});
                        const newRefreshToken = jwt.sign({id: store.id}, PRIVATE_KEY, {expiresIn: '1d', algorithm: 'RS512'});
                        store.update({
                            refresh_token: newRefreshToken
                        }).then(result => {
                            response.cookie('jwt', newAccessToken, {secure: false, httpOnly: true});
                            // request.store = payloadStore;
                            // response.body.newToken = newAccessToken;
                            console.log(`refresh token result : ${result}, refreshToken updated!`);
                            // response new token payload
                            request.store = payloadStore;
                            request.status = 'refresh token'
                            next();
                        }).catch(error=>{
                            console.error(error);
                        });
                    });
                    return response.status(403).json({message : "this token is invalid"});
                } else {
                    console.error(error);
                    return response.status(400).json({message: "bad token request"});
                }
            } else {
                // response current cookie token payload
                request.store = targetStore;
                next();
            }
        });
    })(request, response);
}