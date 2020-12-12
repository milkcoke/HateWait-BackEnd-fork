
const StoreSession = require('../models/StoreSession');
const responseHeader = require('../config/response_header.json');
const keepAliveMS = 60 * 1000; // 1 minute

// session array remove customizing
Array.prototype.remove = function(targetSessionTime){
    const targetIndex = this.findIndex(session=> session.sessionTime === targetSessionTime);
    console.log(`targetIndex : ${targetIndex}`);
    this.splice(targetIndex, 1);
}


module.exports = function registerSessionAtServer(request, response, next){
    const storeId = request.user.id;
    // Register at storeMap, if not construct 'date?'
    // default Constructor new Date (시간으로 id 부여)
    response.writeHead(200, responseHeader);
    response.setTimeout(keepAliveMS, ()=> {
        response.write(`event: ping`);
        response.write(`data: ${JSON.stringify("timeout!")}`);
    });

    const clientSession = new StoreSession(response);

    // 첫 로그인이면 map 에 등록하며 첫 세션 등록, 아니면 해당 가게 아이디 세션 배열리스트에 추가
    !storeMap.has(storeId) ? storeMap.set(storeId, [clientSession]) : storeMap.get(storeId).push(clientSession)

    // 연결 해제 이벤트 등록, 로그아웃 or 창 닫기 or Activity Destroy 시 세션 해제 => 배열에서 삭제.
    request.on('close', ()=>{
        console.log(`session time : ${clientSession.sessionTime} is closed`);
        storeMap.get(storeId).remove(clientSession.sessionTime);
    });

    next();
}