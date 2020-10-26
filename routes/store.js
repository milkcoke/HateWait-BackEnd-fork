const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');
const Models = require('../models');
const storeModel = Models.store;


router.get('/', function(request, response) {
    const sql = 'SELECT * FROM store';
    dbConnection().execute(sql, (error, rows) => {
        if (error) {
            console.error(error);
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
    //권한을 확인하는게 필요하긴함. (가게 정보는 일단 open 된 정보므로 별도의 인증과정 X)
    dbConnection().execute(sql, [request.params.id],(error, rows) => {
        if (error) {
            console.error(error);
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

//일단 권한 검사 없이 일부 Patch 만 구현
// ORM 은 SQL Injection 으로 부터 안전한가?
router.patch('/:id', (request, response) => {
    const storeId = request.params.id;
    const targetObject = request.body;
    //body 가 비어있었다면 throw Error
    if (!targetObject) {
        throw new Error('아이디 입력이 잘못됐습니다.');
    }
    //오로지 하나의 key-value 쌍만 body로 날아옴.
    const targetKey = Object.keys(targetObject)[0];
    const targetValue = targetObject[targetKey];
    console.log(`targetKey : ${targetKey} , targetValue: ${targetValue}`);

    storeModel.findOne({
        where : {id: storeId}
    })
        .then(store=> {
            console.log(`store : ${store}`);
            return store.update({
                targetValue
            }, {
                fields : [targetKey],
                limit : 1
            });
        })
        .then(result => {
            console.log(`result : ${result}`);
            return response.status(200).json({
                message: "수정 완료"
            })
        })
        .catch(error => {
            console.error(error);
            return response.status(500).json({
                message: "서버 내부 오류입니다."
            })
        });
});
module.exports = router;