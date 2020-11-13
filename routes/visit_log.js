const express = require('express');
const router = express.Router();
const getPoolConnection = require('../db/dbConnection');
const period = require('../config/visit_log_default_period_settings');
const check_id = require('../function/check_id');

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
        check_id.store(request.params.storeId)
        .catch(error=>{
            return response.status(500).json({
                message: "서버 내부 오류입니다."
            });
        })
        .then(storeId=>{
            if (!storeId) {
                return response.status(404).json({
                    message : "헤잇웨잇에 가입된 가게가 아닙니다."
                });
            } else {
                return storeId;
            }
        })
        .then(storeId=> {
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
                    sql = `SELECT DATE_FORMAT(visit_time, '%Y-%m') AS visit_month, SUM(customer_number) AS monthly_customer_number
                        FROM visit_log
                        WHERE store_id = ?
                        GROUP BY visit_month
                        ORDER BY visit_month DESC`;
                    break;
                case 'week' :
                    sql = `SELECT CONCAT(DATE_FORMAT(DATE_SUB(visit_time, INTERVAL WEEKDAY(visit_time)*1 DAY), '%Y-%m-%d'),
                                ' ~ ',
                                DATE_FORMAT(DATE_ADD(visit_time, INTERVAL 6 - WEEKDAY(visit_time) DAY), '%Y-%m-%d')) AS visit_week,
                                SUM(customer_number) AS weekly_customer_numeber
                        FROM visit_log
                        WHERE store_id = ?
                        GROUP BY visit_week
                        ORDER BY visit_week DESC`;
                    break;
                case 'day' :
                    sql = `SELECT DATE_FORMAT(visit_time, '%Y-%m-%d') AS visit_day, SUM(customer_number) AS daily_customer_number
                       FROM visit_log
                       WHERE store_id = ?
                       GROUP BY visit_day
                       ORDER BY visit_day DESC`;
                    break;
                default :
                    //mode가 month, week, day 중에 없는 경우
                    return response.status(400).json({
                        message: "잘못된 요청입니다."
                    });
                    break;
            }

            getPoolConnection(connection=>{
                connection.execute(sql, [storeId], (error, rows) => {
                    connection.release();
                    if (error) {
                        console.error(error);
                        return response.status(500).json({
                            message: "서버 내부 오류입니다."
                        })
                    } else if (rows.length === 0) {
                        return response.status(200).json({
                            message: "아직 방문 기록이 없어요!"
                        });
                    } else {
                        // rows,
                        return response.status(200).json({
                            count : rows.length,
                            logs : rows
                        });
                    }
                });
            });
        });

});

//일자별 통계
// router.get('/:storeId',(request, response)=>{
//
// });

module.exports = router;