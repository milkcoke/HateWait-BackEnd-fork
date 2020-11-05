const express = require('express');
const router = express.Router();
const getPoolConnection = require('../db/db2');
const checkId = require('../db/check_id').member;
const memberModel = require('../models/index').member;

router.get('/', function(req, res) {
    const sql = 'SELECT * FROM MEMBER';
    getPoolConnection(connection=>{
        connection.execute(sql, (error, rows) =>{
            if (error) {
                res.send(error);
            } else {
                res.json(rows);
            }
        });
        connection.release();
    })
});

router.get('/:id', (request, response) => {
    const memberId = request.params.id;
    const sql = 'SELECT id, name, phone, email, no_show FROM MEMBER WHERE id=?';
    getPoolConnection(connection=>{
        connection.execute(sql,[memberId], (error, rows) => {
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
        connection.release();
    });
});

// in Tablet, member id check, return member Name
router.post('/', (request, response) => {
    const memberId = request.body.id;
    const sql = 'SELECT name FROM member where id=?';
    getPoolConnection(connection=>{
        connection.execute(sql, [memberId], (error, rows) => {
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
        connection.release();
    })
});
// router.patch('/:id', (request, response) => {
//
// })

module.exports = router;