const express = require('express');
const router = express.Router();
const db = require('../db/db.js');

router.get('/', function(req, res) {
    db.query('SELECT * FROM member', (error, rows) => {
        if(error) res.send(error);
        res.send(rows);
    })
});

module.exports = router;