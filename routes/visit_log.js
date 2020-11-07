const express = require('express');
const router = express.Router();
const getPoolConnection = require('../db/db2');
const period = require('../config/visit_log_default_period_settings');

//only support 'Web' application
//전체 가게 이용 내역 조회
//mode : 통계 '모두', '연간', '월간', '주간', '일간',
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
    const monthSql = `SELECT DATE(visit_time) AS visit_date, SUM(customer_number) AS total_customer_number 
                FROM visit_log
                WHERE store_id=?
                GROUP BY DATE(visit_date)
                ORDER BY visit_date DESC`;

    const sql = `SELECT DATE(visit_time) AS visit_date, SUM(customer_number) AS total_customer_number 
                FROM visit_log
                WHERE store_id=?
                GROUP BY DATE(visit_date)
                ORDER BY visit_date DESC`;

    // SELECT DATE(visit_time) , customer_number
    // FROM visit_log
    // WHERE store_id='bani123' AND DATE(visit_time) BETWEEN (NOW() - INTERVAL 7 DAY) AND NOW()
    // ORDER BY visit_time DESC;

    switch (request.params.mode) {
        // case 'month' :
        //     break;
        // case 'week' :
        //     // const sql = '';
        //     break;
        case 'day' :
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
            break;

        default :
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
            break;
    }

});

//일자별 통계
// router.get('/:storeId',(request, response)=>{
//
// });