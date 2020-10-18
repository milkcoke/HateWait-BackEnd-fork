const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');

router.get('/', function(req, res) {
    const sql = 'SELECT * FROM store';
    dbConnection().execute(sql, (error, rows) => {
        if (error) {
            res.send(error);
        } else {
            res.json(rows);
        }
    });
});

module.exports = router;