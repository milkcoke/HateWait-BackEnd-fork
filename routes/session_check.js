const router = require('express').Router();

router.get('/', (request, response)=>{
    console.log('======storeMap======');
    console.log(storeMap);

    return response.json({storeMap: [storeMap]});
});

module.exports = router;