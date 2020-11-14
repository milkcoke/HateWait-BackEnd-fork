const express = require('express');
const router = express.Router();

router.ws('/', (ws, request)=>{
    console.log('we requested from routing!')
    ws.on('message', msg=>{
        ws.send(`server send : ${msg}`);
        console.log(msg, "I'm in ws route!!");
    });
});

module.exports = router;
