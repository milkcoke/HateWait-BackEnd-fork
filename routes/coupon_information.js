const express = require('express');
const router = express.Router({mergeParams : true});
const getPoolConnection = require('/db/db');

router.get('/', (request, response)=>{
    const storeId = request.params.id;
    const sql = `SELECT coupon_enable FROM store WHERE id=?`;
    getPoolConnection(connection=>{
        connection.execute(sql, [storeId], (error, rows)=>{
            if (error) {
               console.error(error);
               return response.status(500).json({
                   message: "서버 내부 오류입니다."
               });
            } else {
                // coupon_enable == NULL (한 번도 지정 X)
                if (!rows[0].coupon_enable) {
                    connection.release();
                    return response.status(204);
                } else {
                    const getCouponInformationSql = `SELECT * FROM coupon_information WHERE id=? LIMIT 1`;
                    connection.execute(getCouponInformationSql, [storeId], (error, rows)=>{
                        connection.release();
                        if(error) {
                            console.error(error);
                            return response.status(500).json({
                                message: "서버 내부 오류입니다."
                            });
                        } else {
                            return response.status(200).json({
                                couponInformation : rows
                            });
                        }
                    });
                }
            }
        });
    });
});

module.exports = router;