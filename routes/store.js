const express = require('express');
const router = express.Router();
const waitingCustomerRouter = require('./waiting_customer');
const couponInformationRouter = require('./coupon_information');
const getPoolConnection = require('../db/db.js');
const Models = require('../models');
const storeModel = Models.store;
const couponInformationModel = Models.coupon_information;
const bcrypt = require('bcrypt');
const bcryptSetting = require('../config/bcrypt_setting');
const checkId = require('../function/check_id');


router.get('/', function(request, response) {
    const sql = 'SELECT * FROM store';
    getPoolConnection(connection=>{
        connection.execute(sql, (error, rows) => {
            connection.release();
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
});

//stores/:id/waiting-customers 로 넘기고싶음 next 를 통해
// :id는 유지한 채로...

router.get('/:id', function(request, response) {
    const sql = 'SELECT id, name, phone, email, info, business_hour, maximum_capacity, address, coupon_enable FROM store WHERE id=?';
    //권한을 확인하는게 필요하긴함. (가게 정보는 일단 open 된 정보므로 별도의 인증과정 X)
    getPoolConnection(connection=>{
        connection.execute(sql, [request.params.id],(error, rows) => {
            connection.release();
            if (error) {
                console.error(error);
                response.status(500).json({
                    message: "서버 데이터베이스 오류입니다."
                });
            } else if(!rows[0]) {
                response.status(404).json({
                    message: "가게 아이디를 확인해주세요"
                });
            } else {
                response.status(200).json({
                    storeInfo: rows[0]
                });
            }
        });
    });
});
// mainURL/stores/:id/waiting-customers
router.use('/:id/waiting-customers', waitingCustomerRouter);
// mainURL/stores/:id/coupon-information
router.use('/:id/coupon-information', couponInformationRouter);


//일단 권한 검사 없이 일부 Patch 만 구현
// ORM 은 SQL Injection 으로 부터 안전한가?
router.patch('/information', (request, response) => {
    const storeId = request.body.id;
    console.log(`storeId : ${storeId}`);
    const newStoreInfo = request.body;
    // 새 정보에서 id는 제외시키고 시작함.
    delete newStoreInfo.id;
    // id가 비워져있는 요청 예외처리.
    if (!storeId) {
        return response.status(400).json({
            message: "비정상적인 요청입니다."
        });
    }


    //올바르지 않은 id로 가게정보 수정을 요청한경우.
    //여기가 비동기라 아래가 실행되는게 문제임.
    checkId.store(storeId)
        .catch(error => {
            console.error(error);
            return response.status(500).json({
                message: "서버 내부 오류입니다."
            });
        })
        .then(result=>{
            if (result === null) {
                return response.status(400).json({
                    message: "비정상적인 요청입니다."
                });
            } else {
                //하나의 then 안에 묶고싶지 않아 어거지로 Promise 처리 , 추후 수정할 필요가 있음.
                return new Promise((resolve) => {
                    resolve('OK');
                });
            }
        })
        .then(result=>{
            //null 이면 끝내자.
            if(result != 'OK') return;
            //오로지 하나의 key-value 쌍만 body 로 날아옴.
            const targetKey = Object.keys(newStoreInfo)[0];
            let targetValue = newStoreInfo[targetKey];
            console.log(`targetKey: ${targetKey}, targetValue : ${targetValue}`);
            console.log(couponInformationModel);

            storeModel.findOne({
                where : {id: storeId}
            })
                .then(store => {
                    switch (targetKey) {
                        case 'pw':
                            bcryptSetting.SALT
                                .then(salt => {
                                    return bcrypt.hash(targetValue, salt);
                                })
                                .then(newHashedPassword => {
                                    //    store password (orm)
                                    targetValue = newHashedPassword
                                })
                                .catch(error => {
                                    console.error(error);
                                    return response.status(500).json({
                                        message : "비밀번호 암호화 오류입니다. 다시 시도해주세요"
                                    });
                                });
                            break;

                        case 'coupon_enable' :
                            //쿠폰 사용 X
                            if (!targetValue) {
                                console.log('store is trying to change coupon_enable!');
                            } else {
                                const newCouponInfo = newStoreInfo.coupon_information;
                                // check property name & length
                                if(!newCouponInfo.hasOwnProperty('benefit_description') || !newCouponInfo.hasOwnProperty('maximum_stamp') ||
                                !newCouponInfo.hasOwnProperty('validity_period_days') || !newCouponInfo.hasOwnProperty('remark')) {
                                    return response.status(400).json({
                                        message: "쿠폰 정보 등록 또는 수정 요청이 잘못되었습니다."
                                    });
                                }
                                //쿠폰사용 O 추가 정보 수정필요
                                //    store_id, benefit_description, maximum_stamp, validity_period_days, remark
                                // upsert: insert or update a single row
                                // it's like a ON DUPLICATE KEY UPDATE in MySQL
                                couponInformationModel.upsert({
                                    //여기서의 store는 findOne 에서 검색 결과로 나온애.
                                    store_id : store.id,
                                    benefit_description : newCouponInfo.benefit_description,
                                    maximum_stamp : newCouponInfo.maximum_stamp,
                                    validity_period_days : newCouponInfo.validity_period_days,
                                    remark: newCouponInfo.remark
                                }).then(upsertResult => {
                                    console.log(`upsertResult : ${upsertResult}`);
                                    console.log('쿠폰 정보 수정 완료!');
                                }).catch(error => {
                                    console.error(error.message);
                                    return response.status(500).json({
                                        message : "서버 내부, 쿠폰 정보 수정 오류"
                                    });
                                });
                            }
                            break;

                        //    가게명, 전화번호, 영업시간, 가게주소, 수용가능 인원, 가게 소개 문구는 모두 default
                        default :
                            break;

                    }

                    // 가게 정보 어떤 항목이든 결국 항목 갯수는 1개, 업데이트!
                    // targetKey : targetValue << 이거 안됨. 'key' 가 계산되지 않음.
                 //   해결 방법은 use bucket '[]'
                 // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#Computed_property_names
                 //   비밀번호 변경시 sync 함수사용과 return 복붙 외의 좋은 방법이 없을까 다음 코드 중복 없이 한번에 깔끔하게.
                    return store.update({
                        [targetKey] : targetValue
                    }, {
                        fields : [targetKey],
                        limit : 1
                    });
                })
                .then(result => {
                    return response.status(200).json({
                        message: "수정 완료!"
                    });
                })
                .catch(error => {
                    console.error(error);
                    return response.status(500).json({
                        message: "가게 정보 수정 실패, 서버 오류입니다."
                    });
                });
        });

});


module.exports = router;