
// 여기 도달하기 전에 앞에서 valid token & user type check 를 수행함.
module.exports = function isValidRequest(request, response, next) {

    // this is from client token
    const {id: tokenUserId} = request.user;

    // these are from router (request URL, so should be matched this with token)
    let requestId = null;
    // 요청 리소스가 손님 일 때
    if (request.userType === 'member') {
        requestId = request.params.id || request.params.memberId;
    } else {
    // 요청 리소스가 가게 일 때
        requestId = request.params.id || request.params.storeId;
    }

    if (tokenUserId !== requestId) {
        // 본인이 로그인된 아이디가 아닌 다른 아이디 리소스 정보를 요청할 경우
        return response.status(403).json({
            message: "잘못된 접근입니다. 다시 로그인 해주세요"
        });
    }

    next();
}