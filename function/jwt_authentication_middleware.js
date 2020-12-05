const passport = require('passport');


// 진짜 이쪽 customizing 한거는 툭 건들면 팡 터질 수 있다..
// passport module default behavior 가 좀 이상하다..

module.exports = function authenticationToken(request, response, next){
    //성공시 store model 이 넘어옴, 실패시 statusCode (done 의 3rd parameter 가 넘어오지도 않음)
    passport.authenticate('jwt', {session: false}, (error, user, errorStatus)=> {

        //2nd parameter is object (if fail => false, success => userModel, userType)
        console.log(`error: ${error}`);
        const {userInfo, userType : TokenUserType} = user; // if fail => destructuring fail
        console.log(`errorStatus: ${errorStatus}`);
        // type check (this type is served by previous middleware)
        const correctUserType = request.userType;
        console.log(`request.userType: ${request.userType}`);

        // object key name is automatically transformed from Upper case to lower case
        // const authorizationHeader = request.cookies['authorization'];

        //if there is no token stored in cookies, the request is unauthorized
        // and passport jwt authenticate function return 'false' (that doesn't find id of jwt payload)
        if (error) return response.status(500).json({message: "서버 내부 오류입니다."});

        // DB Query 이전에 토큰 검열 자체에서 reject 되면 errorStatus 가 넘어옴.
        // https://github.com/auth0/node-jsonwebtoken Token Authentication Error Document..
        if (errorStatus) {
            const {name: errorName = null, message: errorMessage = null} = errorStatus;
            if (errorName === 'TokenExpiredError') errorStatus.code = 401;
            if (errorMessage === 'No auth token') errorStatus.code = 400;
            else { console.dir(errorStatus); }
        } else {
            // DB Query 결과는 날라간 상태 but 가게 아이디를 회원에서, 회원 아이디를 가게에서 한 경우 여기로옴.
            // 가게 토큰을 가지고 손님, 손님 토큰을 가지고 가게 리소스를 요청할 경우
            console.log(`token user type: ${TokenUserType}, token user Info : ${userInfo}`);
            if (TokenUserType !== correctUserType) errorStatus = {code : 403};
        }


        // if (!user) {
        // 이 중복된 코드 반드시 Refactoring 하자. 보기 좋기 위해서 위에서 리턴안하고 switch-case 로 넘김.
        if (!userInfo || TokenUserType !== correctUserType) {
            switch (errorStatus.code) {
                case 400:
                    return response.status(errorStatus.code).json({message: "토큰이 존재하지 않습니다. 로그인해주세요."});
                case 401:
                    return response.status(errorStatus.code).json({message: "토큰이 만료되었습니다. 다시 로그인해주세요."});
                case 403:
                    // 가게 토큰을 가지고 손님, 손님 토큰을 가지고 가게 리소스를 요청할 경우
                    return response.status(errorStatus.code).json({message: "잘못된 요청입니다. 계정 유형을 확인해주세요"});
                case 404:
                    const accountTypeText = (TokenUserType === 'member') ? '손님이' : '가게가';
                    return response.status(errorStatus.code).json({message: `헤잇웨잇에 가입된 ${accountTypeText} 아닙니다.`});
                default :
                    console.log(`statusCode : ${errorStatus.code}`);
                    return response.status(errorStatus.code || 500).json({message: "여까지 왜왔지..개발자를 욕해주세요?"});
            }
        } else {
            //    token 이 유효하고 실제 유저 정보를 불러온 경우 (DB 에서 찾은 경우)
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