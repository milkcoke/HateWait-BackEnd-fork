const express = require('express');
const router = express.Router();
const getPoolConnection = require('../db/db2');
const period = require('../config/visit_log_default_period_settings');

//only support 'Web' application
//전체 가게 이용 내역 조회
//mode : 통계 '모두' '월간', '주간', '일간',
router.get('/:storeId/:mode', (request, response)=> {
    // 요청 형식이 잘못된 경우
    if(!request.params.storeId || !request.params.mode) {
        return response.status(400).json({
            message: "올바르지 않은 요청입니다."
        });
    }
    // 기간 설정 필요한 경우.
    //추가 : WHERE store_id=? AND DATE(visit_time) BETWEEN (NOW() - INTERVAL ? ?) AND NOW()
    // 총 손님 수..?

    //기간 설정 쿼리 예시
    // SELECT DATE(visit_time) , customer_number
    // FROM visit_log
    // WHERE store_id='bani123' AND DATE(visit_time) BETWEEN (NOW() - INTERVAL 7 DAY) AND NOW()
    // ORDER BY visit_time DESC;
        let sql = null;

        switch (request.params.mode) {
            case 'month' :
                sql = `SELECT DATE_FORMAT(visit_time, '%Y-%m') AS visit_date_month, SUM(customer_number) AS monthly_customer_number
                        FROM visit_log
                        WHERE store_id = ?
                        GROUP BY visit_date_month
                        ORDER BY visit_date_month DESC`;
                break;
            case 'week' :
                sql = `SELECT CONCAT(DATE_FORMAT(DATE_SUB(visit_time, INTERVAL WEEKDAY(visit_time)*1 DAY), '%Y-%m-%d'),
                                '~',
                                DATE_FORMAT(DATE_ADD(visit_time, INTERVAL 6 - WEEKDAY(visit_time) DAY), '%Y-%m-%d')) AS visit_date_week,
                                SUM(customer_number) AS weekly_customer_numeber
                        FROM visit_log
                        WHERE store_id = ?
                        GROUP BY visit_date_week
                        ORDER BY visit_date_week DESC`;
                break;
            case 'day' :
                sql = `SELECT DATE(visit_time) AS visit_date, SUM(customer_number) AS daily_customer_number
                       FROM visit_log
                       WHERE store_id = ?
                       GROUP BY visit_date
                       ORDER BY visit_date DESC`;
                break;
            default :
                break;
        }

        getPoolConnection(connection=>{
            connection.execute(sql, [request.params.storeId], (error, rows) => {
                connection.release();
                if (error) {
                    console.error(error);
                } else if (rows.length === 0) {
                    return response.status(200).json({
                        message: "아직 방문 기록이 없어요!"
                    });
                } else {
                    return response.status(200).json({
                        rows
                    })
                }
            })
        });

});

//일자별 통계
// router.get('/:storeId',(request, response)=>{
//
// });