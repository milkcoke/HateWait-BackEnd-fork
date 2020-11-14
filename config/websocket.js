// webSocket Initialize
const webSocket = require('ws');

//customizing ~...
module.exports = function(server, app) {
    //webSocket Server Create!
    const webSocketServer = new webSocket.Server({server: server});
    console.log('websocket Server creating..');

    // Register Event
    webSocketServer.on('connection', (socketClient, request)=>{
        const clientIp = request.connection.remoteAddress;
        app.locals.clients = webSocketServer.clients;
        console.log(`${clientIp} 클라이언트 접속 요청 !`);

        socketClient.on('message', requestMessage=>{
            console.log('클라이언트로 부터 받은 메시지 : ', requestMessage);
        })
        socketClient.on('error', error=>{
            console.error(error, '클라이언트 연결 중 오류');
        })
        socketClient.on('close', ()=>{
            console.log('socket closed');
            console.log(`${clientIp} 클라이언트 연결 종료`);
        });
    });
}

