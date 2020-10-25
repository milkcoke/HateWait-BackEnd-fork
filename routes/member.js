const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');
const memberModel = require('../models/index').member;

router.get('/', function(req, res) {
    const sql = 'SELECT * FROM MEMBER';
    dbConnection().execute(sql, (error, rows) => {
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

router.get('/:id', (request, response) => {
    const memberId = request.params.id

    const sql = 'SELECT id, name, phone, email, no_show FROM MEMBER WHERE id=?';
    dbConnection().execute(sql,[memberId], (error, rows) => {
        if (error) {
            console.error(error);
            return response.status(500).json({
                message: "서버 내부 오류입니다."
            });
        } else {
            return response.status(200).json({
                memberInfo: rows[0]
            });
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

router.patch('/:id', (requeset, response) => {

})

module.exports = router;