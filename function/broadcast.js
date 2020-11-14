const ws = require('ws');

module.exports = function (clients, message) {
    clients.forEach(client=>{
        if(client.readyState === ws.OPEN){
            client.send(message);
        }
    })
}