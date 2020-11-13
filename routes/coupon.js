const express = require('express');
const router = express.Router();
const getPoolConnection = require('../db/db');
const Models = require('../models');
const storeModel = Models.store;

// 앱에서만 사용 (손님 회원 쿠폰&스탬프 보유 현황 확인)
// //return info : 가게명, 쿠폰 발급 기준 스탬프수, 해당 회원 보유 스탬프 수, 발급 쿠폰 수
router.get('/member/:memberId', (request, response) => {
    const memberId = request.params.memberId;
    // Template Literals (Template Strings) : allowing embedded expressions.
    // you can use multi-line strings and string interpolation features with them.
    // [Reference] : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
    // Condition statement in INNER JOIN vs WHERE .. (Not yet)
    const sql = `SELECT DISTINCT store.id AS store_id, store.name AS store_name, stamp.count AS stamp_count, cuinfo.maximum_stamp AS maximum_stamp,
        (SELECT COUNT(*) FROM coupon WHERE store_id = store.id AND member_id=?) AS coupon_count
        FROM stamp INNER JOIN store ON stamp.store_id = store.id
        INNER JOIN coupon_information AS cuinfo ON store.id = cuinfo.store_id
        INNER JOIN visit_log ON store.id = visit_log.store_id
        WHERE store.coupon_enable = true AND visit_log.member_id=?
        ORDER BY visit_log.visit_time DESC`;

    getPoolConnection(connection=>{
        connection.execute(sql, [memberId, memberId], (error, rows) => {
            connection.release();
            if (error) {
                console.error(error);
                return response.status(500).json({
                    message: '서버 내부 오류입니다.'
                });
            } else if(rows.length === 0) {
                return response.status(200).json({
                    message: '보유한 스탬프 & 쿠폰이 없어요'
                });
            } else {
                // store_name, stamp_count, maximum_stamp, coupon_count
                return response.status(200).json({
                    array : rows
                });
            }
        });
    });
});

// 앱에서만 적용 (보유 쿠폰 현황 확인용)
router.get('/member/:memberId/store/:storeId', (request, response) => {
    // 가게 이름이 중복된 경우 문제가 생김.
    if(!request.params.hasOwnProperty('memberId') || !request.params.hasOwnProperty('storeId')) {
        return response.status(400).json({
            message : "잘못된 요청입니다."
        });
    }
    storeModel.findOne({
        where : {
            id : request.params.storeId,
            coupon_enable : true
        }
    }).then(store => {
        if(!store) {
            return response.status(409).json({
                message : '가게 이름이 바뀌었거나 더 이상 쿠폰 혜택을 제공하지 않습니다.'
            });
        }
        console.log(`storeId : ${store.id}`);
        //나중에 발행된 순서대로 위에옴.
        const sql = `SELECT issue_date, expiration_date, used_date FROM coupon WHERE member_id=? AND store_id=? ORDER BY issue_date DESC`;
        getPoolConnection(connection=>{
            connection.execute(sql, [request.params.memberId, store.id], (error, rows)=> {
                connection.release();
                if (error) {
                    console.error(error.message);
                    return response.status(500).json({
                        message : "서버 내부 오류입니다."
                    })
                } else if (rows.length === 0) {
                    return response.status(200).json({
                        message : "아직 발행된 쿠폰이 없습니다."
                    })
                } else {
                    return response.status(200).json({
                        coupons : rows
                    });
                }
            });
        });
    })
    .catch(error=>{
        console.error(error);
        return response.status(500).json({
            message : "서버 내부 오류입니다."
        });
    });
});

module.exports = router;