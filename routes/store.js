const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');

router.get('/', function(request, response) {
    const sql = 'SELECT * FROM store';
    dbConnection().execute(sql, (error, rows) => {
        if (error) {
            response.status(500).json({
                message: "서버 데이터베이스 오류입니다."
            });
        } else {
            response.status(200).json({
                allMembers: rows
            });
        }
    });
});

router.get('/:id', function(request, response) {
    const sql = 'SELECT id, name, phone, email, info, business_hour, maximum_capacity, address, coupon_enable FROM store WHERE id=?';
    //권한을 확인하는게 필요하긴함. (가게 정보는 일단 open된 정보므로 별도의 인증과정 X)
    dbConnection().execute(sql, [request.params.id],(error, rows) => {
        if (error) {
            response.status(500).json({
                message: "서버 데이터베이스 오류입니다."
            });
        } else if(!rows[0]) {
            response.status(409).json({
                message: "가게 id를 확인해주세요"
            });
        } else {
            response.status(200).json({
                storeInfo: rows[0]
            });
        }
    });
});


module.exports = router;