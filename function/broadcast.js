const ws = require('ws');

module.exports = function (clients, message) {
    console.log(`clients : ${clients}`);
    if (!clients.length) return;
    clients.forEach(client=>{
        if(client.readyState === ws.OPEN){
            client.send(message);
        }
    })
}