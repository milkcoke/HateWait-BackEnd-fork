const passport = require('passport');

module.exports = function authenticationToken(request, response, next){
    //성공시 store model 이 넘어옴, 실패시 statusCode (done 의 3rd parameter 가 넘어오지도 않음)
    passport.authenticate('jwt', {session: false}, (error, user, errorStatus)=> {

        //2nd parameter is object (if fail => false, success => userModel, userType)
        console.log(`error: ${error}`);
        const {userInfo, userType : TokenUserType} = user; // if fail => destructuring fail
        console.log(`token user type: ${TokenUserType}, token user Info : ${userInfo}`);
        console.log(`errorStatus: ${errorStatus}`);
        // type check (this type is served by previous middleware)
        const correctUserType = request.userType;

        //    object key name is automatically transformed from Upper case to lower case
        // const authorizationHeader = request.cookies['authorization'];

        //if there is no token stored in cookies, the request is unauthorized
        // and passport jwt authenticate function return 'false' (that doesn't find id of jwt payload)
        if (error) return response.status(500).json({message: "서버 내부 오류입니다."});

        // correctUserType is from request URL vs userType is from request Token
        // if don't sync between them => token is not valid (bad request)
        if (TokenUserType !== correctUserType) {
            // 가게 토큰을 가지고 손님, 손님 토큰을 가지고 가게 리소스를 요청할 경우
            return response.status(403).json({message: "올바르지 않은 요청입니다. 다시 로그인 해주세요."});
        }

        if (errorStatus) {
            const {name: errorName = null, message: errorMessage = null} = errorStatus;
            if (errorName === 'TokenExpiredError' || errorMessage === 'No auth token') errorStatus.code = 401;
            else {
                console.dir(errorStatus);
            }
        }

        if (!user) {
            switch (errorStatus.code) {
                case 401:
                    return response.status(errorStatus.code).json({message: "토큰이 유효하지 않습니다. 다시 로그인해주세요."});
                case 404:
                    const accountTypeText = (TokenUserType === 'member') ? '손님이' : '가게가';
                    return response.status(errorStatus.code).json({message: `헤잇웨잇에 가입된 ${accountTypeText} 아닙니다.`});
                default :
                    console.log(`statusCode : ${errorStatus.code}`);
                    return response.status(errorStatus.code || 500).json({message: "여까지 왜왔지..개발자를 욕해주세요?"});
            }
        } else {
            //    token 이 유효하고 실제 유저 정보를 불러온 경우
            request.user = {
                id: userInfo.id,
                name: userInfo.name,
                type: TokenUserType
            };
            next();
        }
    // });
    })(request, response, next);
}