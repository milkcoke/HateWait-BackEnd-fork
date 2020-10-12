const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');

router.get('/', function(req, res) {
    dbConnection().query('SELECT * FROM MEMBER', (error, rows) => {
        if (error) {
            res.send(error);
        } else {
            res.json(rows);
        }
    });
});

module.exports = router;