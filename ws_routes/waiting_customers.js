const express = require('express');
const router = express.Router({mergeParams: true});
const ws = require('ws');

const broadcast = (clients, message) =>{
    clients.forEach(client=>{
        if(client.readyState === ws.OPEN){
            client.send(message);
        }
    })
}
router.get('/', (request, response)=>{
    console.log('we requested from routing!');
    broadcast(request.app.locals.clients, "Hi Guys!");
    return response.status(200).end();
});

module.exports = router;
