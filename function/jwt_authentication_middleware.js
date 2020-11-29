const fs = require('fs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const path = require('path');
const storeModel = require('../models').store;

module.exports = function authenticationToken(request, response, next){
    //성공시 store model 이 넘어옴, 실패시 statusCode (done 의 3rd parameter 가 넘어오지도 않음)
    passport.authenticate('jwt', {session: false}, (error, store, status)=>{
        //여기서 false 가 나오는 이유? -> passport  jwt option : jwtFromRequest: fromAuthHeader
        // 우리는 지금 cookie 를 추출하고 있음.

        console.log(`error: ${error}`);
        console.log(`store: ${store}`);
        //    token comes from the header
        //    object key name is automatically transformed from Upper case to lower case
        // const authorizationHeader = request.cookies['authorization'];

        //if there is no token stored in cookies, the request is unauthorized
        // and passport jwt authenticate function return 'false' (that doesn't find id of jwt payload)
        if(error) return response.status(500).json({message: "서버 내부 오류입니다."});
        status? console.log(status) : console.log(`status is missing`);

        if(status.name === 'TokenExpiredError') return response.status(401).json({message: "your token is expired"});

        if(!store) {
            switch (status.code) {
                case 404:
                return response.status(404).json({message: "헤잇웨잇에 가입된 가게가 아닙니다."});
                break;
                default :
                console.log(`statusCode : ${status.code}`);
                return response.status(status.code || 500).json({message: "여까지 왜왔누?"});
                break;
            }
        } else {
        //    token 이 유효하고 실제 유저 정보를 불러온 경우
            request.store = {
                id: store.id,
                name : store.name
            };
            next();
        }

        /*
        //클라이언트 단에서 만료시간 지나면 토큰 재발급 요청하는게 더 나음.
        //일단 편의를 위해 서버단에서 토큰 만료시 자동 재발급 요청 로직 추가
        const accessToken = request.cookies['jwt'];

        //verify 할때는 algorithms : array 이고
        //default callback (1st: error, 2nd: payload of jwt)

            if(!store.refresh_token) return response.status(403).json({message: "Don't try to hack"});

                const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '..','config', 'id_rsa_public_refresh.pem'), 'utf8');
                const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '..','config', 'id_rsa_private.pem'), 'utf8');
                const REFRESH_PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '..','config', 'id_rsa_private_refresh.pem'), 'utf8');

                jwt.verify(store.refresh_token, PUBLIC_KEY, {algorithms: ['RS512']}, (error, payloadStore)=>{
                    //refresh token is invalid
                    if(error) {
                        console.error(error);
                        if(error.name === 'TokenExpiredError') {
                            //refresh token 이 오래된 경우
                            const newRefreshToken = jwt.sign({id: store.id}, REFRESH_PRIVATE_KEY, {expiresIn: '1d', algorithm: 'RS512'});
                            store.update({
                                refresh_token: newRefreshToken
                            }).then(result => {
                                response.cookie('jwt', newAccessToken, {secure: false, httpOnly: true});
                                console.log(`refresh token result : ${result}, refreshToken updated!`);

                                // response new token payload
                                request.store = payloadStore;
                                request.status = 'refresh token'
                            }).catch(error=>{
                                console.error(error);
                            });
                        } else {
                            return response.status(403).json({message: "refresh token is invalid (not with exp)"})
                        }
                    } else {
                        console.log(`store refreshToken Payload: ${payloadStore}`);
                        console.log(`refresh Token exp: ${payloadStore.exp} VS now time : ${Math.floor(Date.now()/ 1000)}`);
                        console.log(`exp convert: ${new Date(payloadStore.exp)} VS now Time: ${new Date()}`)
                    }
                    // refresh token 에러 없는 경우 (유효기간 내에 보유중)
                    const newAccessToken = jwt.sign({id: store.id}, PRIVATE_KEY, {expiresIn: '30s', algorithm: 'RS256'});
                    response.cookie('jwt', newAccessToken, {secure: false, httpOnly: true});
                    request.store = payloadStore;
                    next();
                });
                // 기간말고 딴거때메 access token 유효하지 않음.
                return response.status(401).json({message: "유효하지 않은 요청입니다. 재로그인 해주세요"});

            // response current cookie token payload
            request.store = targetStore;
            next();


         */
    })(request, response);
}