const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');

router.get('/', function(req, res) {
    let sql = 'SELECT * FROM store';
    dbConnection().query(sql, (error, rows) => {
        if (error) {
            res.send(error);
        } else {
            res.json(rows);
        }
    });
});

module.exports = router;