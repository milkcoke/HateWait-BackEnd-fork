const passport = require('passport');
const storeModel = require('../models').store;

module.exports = function authenticationToken(request, response, next){
    //성공시 store model 이 넘어옴, 실패시 statusCode (done 의 3rd parameter 가 넘어오지도 않음)
    passport.authenticate('jwt', {session: false}, (error, store, status)=>{

        console.log(`error: ${error}`);
        console.log(`store: ${store}`);

        //    object key name is automatically transformed from Upper case to lower case
        // const authorizationHeader = request.cookies['authorization'];

        //if there is no token stored in cookies, the request is unauthorized
        // and passport jwt authenticate function return 'false' (that doesn't find id of jwt payload)
        if(error) return response.status(500).json({message: "서버 내부 오류입니다."});
        if (status) {
            const {name: errorName = null, message: errorMessage = null} = status
            if(errorName === 'TokenExpiredError' || errorMessage === 'No auth token') status.code = 401;
            else {
                console.dir(status);
            }
        }

        if(!store) {
            switch (status.code) {
                case 401:
                return response.status(status.code).json({message: "토큰이 유효하지 않습니다. 다시 로그인해주세요."});
                break;
                case 404:
                return response.status(status.code).json({message: "헤잇웨잇에 가입된 가게가 아닙니다."});
                break;
                default :
                console.log(`statusCode : ${status.code}`);
                return response.status(status.code || 500).json({message: "여까지 왜왔지..개발자를 욕해주세요?"});
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
    })(request, response);
}