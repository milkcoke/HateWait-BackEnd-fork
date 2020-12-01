const passport = require('passport');

module.exports = function authenticationToken(request, response){
    //성공시 store model 이 넘어옴, 실패시 statusCode (done 의 3rd parameter 가 넘어오지도 않음)
    passport.authenticate('jwt', {session: false}, (error, [userInfo, userType], errorStatus)=> {

        console.log(`error: ${error}`);
        console.log(`token user type: ${userType}, token user Info : ${userInfo}`);
        console.log(`errorStatus: ${errorStatus}`);
        const correctUserType = request.userType;

        //    object key name is automatically transformed from Upper case to lower case
        // const authorizationHeader = request.cookies['authorization'];

        //if there is no token stored in cookies, the request is unauthorized
        // and passport jwt authenticate function return 'false' (that doesn't find id of jwt payload)
        if (error) return response.status(500).json({message: "서버 내부 오류입니다."});

        // correctUserType is from request URL vs userType is from request Token
        // if don't sync between them => token is not valid (bad request)
        if (userType !== correctUserType) {
            // errorStatus = {code: 401};
            return response.status(401).json({message: "토큰이 유효하지 않습니다. 다시 로그인해주세요."});
        }

        if (errorStatus) {
            const {name: errorName = null, message: errorMessage = null} = errorStatus;
            if (errorName === 'TokenExpiredError' || errorMessage === 'No auth token') errorStatus.code = 401;
            else {
                console.dir(errorStatus);
            }
        }

        if (!userInfo) {
            switch (errorStatus.code) {
                case 401:
                    return response.status(errorStatus.code).json({message: "토큰이 유효하지 않습니다. 다시 로그인해주세요."});
                    break;
                case 404:
                    return response.status(errorStatus.code).json({message: "헤잇웨잇에 가입된 가게가 아닙니다."});
                    break;
                default :
                    console.log(`statusCode : ${errorStatus.code}`);
                    return response.status(errorStatus.code || 500).json({message: "여까지 왜왔지..개발자를 욕해주세요?"});
                    break;
            }
        } else {
            //    token 이 유효하고 실제 유저 정보를 불러온 경우
            request.user = {
                id: userInfo.id,
                name: userInfo.name,
                type: userType
            };
            return response.status(200).json({
                user: request.user
            });
        }
    // });
    })(request, response);
}