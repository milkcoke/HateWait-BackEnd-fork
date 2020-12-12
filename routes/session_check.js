const router = require('express').Router();

router.get('/', (request, response)=>{
    response.json(storeMap);
});

module.exports = router;