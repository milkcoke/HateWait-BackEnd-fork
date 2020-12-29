const express = require('express');
const router = express.Router({mergeParams : true});
const getPoolConnection = require('../db/dbConnection');

router.get('/', (request, response)=>{
    const errorRespond = (error)=>{
        console.error(error);
        return response.status(500).json({
            message: "서버 내부 오류입니다."
        });
    }

    const storeId = request.params.storeId;
    const sql = `SELECT coupon_enable FROM store WHERE id=?`;
    getPoolConnection(connection=>{
        connection.execute(sql, [storeId], (error, rows)=>{
            if (error) {
                errorRespond(error);
            } else {
                // coupon_enable == NULL (한 번도 지정 X)
                if (rows[0].coupon_enable === null) {
                    connection.release();
                    return response.status(204).end();
                } else {
                    const getCouponInformationSql = `SELECT benefit_description, maximum_stamp, validity_period_days, remark
                                                    FROM coupon_information WHERE store_id=? LIMIT 1`;
                    connection.execute(getCouponInformationSql, [storeId], (error, rows)=>{
                        connection.release();
                        if(error) {
                            errorRespond(error);
                        } else {
                            return response.status(200).json({
                                couponInformation : rows[0]
                            });
                        }
                    });
                }
            }
        });
    });
});

module.exports = router;