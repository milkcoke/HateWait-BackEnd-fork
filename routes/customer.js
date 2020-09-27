const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', function(req, res) {
    db.query('SELECT * FROM customer', (error, rows) => {
        if(error) res.send(error);
        res.send(rows);
    })
});

module.exports = router;