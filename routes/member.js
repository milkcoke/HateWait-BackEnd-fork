const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    dbConnection.query('Select * from member', (error, rows) => {
        if(error) res.send(error);
        res.send(rows);
    })
});

module.exports = router;