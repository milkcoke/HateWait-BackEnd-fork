const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');
const checkId = require('../db/check_id').member;
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
    const memberId = request.params.id;
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
});

// in Tablet, mebmer id check, return member Name
router.post('/', (request, response) => {
    const memberId = request.body.id;
    const sql = 'SELECT name FROM member where id=?';
    dbConnection().execute(sql, [memberId], (error, rows) => {
        if (error) {
           console.error(error);
           return response.status(500).json({
               message: "서버 내부 오류입니다."
           });
        } else if(rows.length === 0) {
           return response.status(409).json({
               message: "아이디를 확인해주세요."
           })
        } else {
            return response.status(200).json({
                message: rows[0].name
            });
        }
    });
});
router.patch('/:id', (request, response) => {

})

module.exports = router;