const express = require('express');
const router = express.Router({mergeParams : true});

router.ws('/', (ws, request)=>{
    ws.on('message', msg=>{
        ws.send(`server send : ${msg}`);
    });
});

module.exports = router;
