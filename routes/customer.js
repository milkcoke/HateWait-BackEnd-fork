const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');

router.get('/', function(req, res) {
    dbConnection().query('SELECT * FROM customer', (error, rows) => {
        if (error) {
            res.send(error);
        } else {
            res.send(rows);
        }
    })
});

module.exports = router;