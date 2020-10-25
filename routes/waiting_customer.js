const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');

// 대기열 정보도 다른 가게에서 알 수 없게 session-cookie 인증이 필요함.
router.get('/:id', (request, response)=> {
    // request.params.id
    const sql = 'SELECT name, people_number FROM waiting_customer WHERE store_id=?';
    dbConnection().execute(sql, [request.params.id], (error, rows)=> {
        if (error) {
           return response.status(500).json({
               message: "서버 오류입니다."
           });
        } else if(rows.length <= 0) {
            return response.status(409).json({
                message: "아무런 손님이 없어요",
                number: 0
            });
        } else {
            return response.status(200).json({
                message: "조회 성공!",
                waiting_customers: rows
            })
        }
    })
});

module.exports = router;