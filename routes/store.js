const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');
const Models = require('../models');
const storeModel = Models.store;
const couponInformationModel = Models.coupon_information;
const bcrypt = require('bcrypt');
const bcryptSetting = require('../config/bcrypt_setting');
const checkId = require('../db/check_id');


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
        .then(result => {
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
        .then((result) => {
            //null 이면 끝내자.
            if(result != 'OK') return;
            console.log(`result : ${result}`);
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
                                .catch( error=> {
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
                                //쿠폰사용 O 추가 정보 수정필요
                                //    store_id, benefit_description, maximum_stamp, validity_period_days, remark
                                couponInformationModel.update({
                                    store_id : storeId,
                                    benefit_description : newStoreInfo.benefit_description,
                                    maximum_stamp : newStoreInfo.maximum_stamp,
                                    validity_period_days : newStoreInfo.validity_period_days,
                                    remark: newStoreInfo.remark
                                }, {
                                    limit : 1
                                }).then(result => {
                                    console.log('coupon info : ' + result);
                                    console.log('쿠폰 정보 수정 완료!');
                                }).catch(error => {
                                    console.error(error);
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
                    return store.update({
                        targetKey : targetValue
                    }, {
                        fields : [targetKey],
                        limit : 1
                    });
                })
                .then(result => {
                    console.dir(result);
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


//test용
router.patch('/test-find', (request, response)=> {
    const storeId = request.body.id;
    delete request.body.id;
    const targetKey = Object.keys(request.body)[0];
    const targetValue = request.body[targetKey];
    console.log(targetKey, targetValue);

    storeModel.findOne({
        where : {id: storeId}
    })
        .catch(error=>{
            console.error(error);
        })
        .then(targetStore=>{
            storeModel.update({
                pw : 'coco'
            }, {
                where: {id: storeId},
                fields: [targetKey],
                limit: 1
            }).then(result=>{
                return response.status(200).json(result);
            }).catch(error=>{
                console.error(error);
                return response.status(500).json(error);
            })
        })
    
    

})
module.exports = router;