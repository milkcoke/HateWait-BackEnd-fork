const express = require('express');
const router = express.Router();
const getPoolConnection = require('../db/db2');

//only support 'Web' application
//전체 가게 이용 내역 조회
//mode : 통계 '모두', '연간', '월간', '주간', '일간',
router.get('/:storeId/:mode', (request, response)=> {
    // 요청 형식이 잘못된 경우
    if(!request.params.id || !request.params.mode) {
        return response.status(400).json({
            message: "올바르지 않은 요청입니다."
        });
    }
    switch (mode) {
        case 'year' :
            // const sql = 'SELECT visit_time, customer_number FROM visit_log where store_id=? ORDER BY visit_time DESC';
            break;
        case 'month' :
            // const sql = '';
            break;
    }

    const sql = 'SELECT visit_time, customer_number FROM visit_log where store_id=? ORDER BY visit_time DESC';
    getPoolConnection(connection=>{
        connection.execute(sql, [request.params.storeId], (error, rows)=> {
            connection.release();
            if (error) {
                console.error(error);
                return response.status(500).json({
                    message : "서버 내부 오류입니다."
                })
            } else if(rows.length === 0) {
                return response.status(404).json({
                    message: "헤잇웨잇에 가입된 가게가 아닙니다."
                });
            } else {
                return response.status(200).json({
                    logs : rows
                });
            }
        });
    })

});

//일자별 통계
// router.get('/:storeId',(request, response)=>{
//
// });