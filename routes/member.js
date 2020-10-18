const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');
const memberModel = require('../models/index').member;

router.get('/', function(req, res) {
    const sql = 'SELECT * FROM MEMBER';
    dbConnection().query(sql, (error, rows) => {
        if (error) {
            res.send(error);
        } else {
            res.json(rows);
        }
    });
        // memberModel.findAll()
        //     .then( allMembers => {
        //         return res.status(200).json(allMembers);
        //     })
        //     .catch (error=> {
        //         console.error(error);
        //         return res.status(500).json(error);
        //     });

});

module.exports = router;