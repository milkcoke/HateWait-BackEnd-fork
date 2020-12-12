const router = require('express').Router();

router.get('/', (request, response)=>{
    console.log('===storeMap===');
    console.log(global.storeMap);

    return response.json(global.storeMap);
});

module.exports = router;