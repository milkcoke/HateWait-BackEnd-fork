const router = require('express').Router();

router.get('/', (request, response)=>{
    return response.json({storeMap});
});

module.exports = router;