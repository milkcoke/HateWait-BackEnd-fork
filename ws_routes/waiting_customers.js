const express = require('express');
const router = express.Router({mergeParams: true});
const broadcast = require('../function/broadcast');


router.get('/', (request, response)=>{
    console.log('we requested from routing!');
    broadcast(request.app.locals.clients, "Hi Guys!");
    return response.status(200).end();
});

module.exports = router;
