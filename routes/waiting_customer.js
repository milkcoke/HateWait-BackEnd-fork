const express = require('express');
const router = express.Router();
const getPoolConnection = require('../db/db2');
const checkId = require('../db/check_id');
// 이거 sync function 인데 왜 return 을 못받는거 같냐 아
const locationUrl = require('../config/url_setting');
const waitingCustomerModel = require('../models').waiting_customer;

// 대기열 정보도 다른 가게에서 알 수 없게 session-cookie 인증이 필요함.
//대기열 조회
router.get('/:id', (request, response)=> {
    // request.params.id
     const storeId = request.params.id;
     checkId.store(storeId)
         .catch(error=> {
             console.error(error);
             return response.status(500).json({
                 message: "서버 오류입니다."
             });
         })
         .then(resultId => {
             console.log(`resultId : ${resultId}`);
            if (resultId === null) {
                return response.status(404).json({
                    message: "헤잇웨잇에 가입된 가게가 아닙니다."
                });
            } else {
                const sql = 'SELECT phone, name, people_number, called_time FROM waiting_customer WHERE store_id=?';
                getPoolConnection(connection=>{
                    connection.execute(sql, [storeId], (error, rows)=> {
                        connection.release();
                        if (error) {
                            console.error(error);
                            return response.status(500).json({
                                message: "서버 오류입니다."
                            });
                        } else if(rows.length === 0) {
                            return response.status(200).json({
                                message: "지금은 손님이 없어요"
                            });
                        } else {
                            return response.status(200).json({
                                waiting_customers: rows
                            });
                        }
                    });
                });
            }
        });
});

//대기열 등록
// where connection release issue ㅠ_ㅠ
router.post('/:id', (request, response)=> {
    const customerInfo = request.body;
    //is_member 비어있으면 아직 회원인지 아닌지 모르는거임.
    const storeId = request.params.id;
    const sql = 'INSERT INTO waiting_customer VALUES (?, ?, ?, ?, ?, ?)';

    //회원이면 id 정보만 받아옴.
    switch (customerInfo.is_member) {
        case true:
            // 회원 id 로부터 전화번호, 이름 얻어옴
            const memberSql = 'SELECT phone, name FROM member where id=?';
            getPoolConnection(connection=>{
                connection.execute(memberSql, [customerInfo.id], (error, rows)=> {
                    if(error) {
                        connection.release();
                        console.error(error);
                        return response.status(500).json({
                            message: "서버 오류입니다."
                        });
                    } else if(rows.length === 0) {
                        connection.release();
                        return response.status(409).json({
                            message: "아이디를 확인해주세요."
                        });
                    } else {
                        const memberPhone = rows[0].phone
                        const memberName = rows[0].name
                        connection.execute(sql, [memberPhone, storeId, memberName, customerInfo.people_number, null, customerInfo.is_member], (error, result)=>{
                            if(error) {
                                connection.release();
                                if (error.code == 'ER_DUP_ENTRY') {
                                    console.error(error.message);
                                    return response.status(409).json({
                                        message: "이미 대기열에 등록된 회원입니다."
                                    });
                                } else {
                                    console.error(error);
                                    return response.status(500).json({
                                        message: "서버 오류입니다."
                                    });
                                }
                            } else {
                                // Error 가 존재하지 않으면
                                const countSql = 'SELECT COUNT(*) as turnNumber FROM waiting_customer WHERE store_id=?';
                                connection.execute(countSql, [storeId], (error, rows) => {
                                    connection.release();
                                    // ER_DUP_ENTRY : PRIMARY CONSTRAINT 에러 , 여기선 이미 등록된 전화번호
                                    if(error) {
                                        console.error(error);
                                        return response.status(500).json({
                                            message: "서버 오류입니다."
                                        });
                                    } else {
                                        console.log(rows[0].turnNumber);
                                        return response.status(201)
                                            .location(locationUrl.waitingCustomerURL + customerInfo.id)
                                            .json({
                                                name: memberName,
                                                count : rows[0].turnNumber
                                            });
                                    }
                                });
                            }
                        })
                    }
                });
            });
            break;
        //    비회원인 경우
        case false:
            getPoolConnection(connection=>{
                connection.execute(sql, [customerInfo.phone, storeId, customerInfo.name, customerInfo.people_number, null, customerInfo.is_member], (error, result)=> {
                    if(error) {
                        connection.release();
                        if (error.code == 'ER_DUP_ENTRY') {
                            console.error(error.message);
                            return response.status(409).json({
                                message: "이미 대기열에 등록된 회원입니다."
                            });
                        } else {
                            return response.status(500).json({
                                message: "내부 서버 오류입니다."
                            });
                        }
                    } else {
                        const countSql = 'SELECT COUNT(*) as turnNumber FROM waiting_customer WHERE store_id=?'
                            connection.execute(countSql, [storeId], (error, rows) =>{
                                connection.release();
                                // ER_DUP_ENTRY : PRIMARY CONSTRAINT 에러 , 여기선 이미 등록된 전화번호
                                if(error) {
                                    console.error(error);
                                    return response.status(500).json({
                                        message: "내부 서버 오류입니다."
                                    });
                                } else {
                                    console.log(rows[0].turnNumber);
                                    return response.status(200).json({
                                        name: customerInfo.name,
                                        count : rows[0].turnNumber
                                    });
                                }
                            });
                    }
                });
            });
            break;
        default:
            console.log('이상하다 여기까지 코드오면 안되는데?');
            return response.status(520).json({
                message: "알 수 없는 오류입니다. 개발자를 욕해주세요"
            });
            break;
    }

});
// 가게에서  손님 호출.
router.patch('/:storeId', (request, response)=> {
    //phone (전화번호) 만 받으면 됨.
    if (!request.body.phone) {
        return response.status(400).json({
            message: "잘못된 요청입니다."
        });
    }

    const sql = 'UPDATE waiting_customer SET called_time=NOW() WHERE phone=? LIMIT 1';
    getPoolConnection(connection=>{
        connection.execute(sql, request.body.phone, (error, result)=> {
            connection.release();
            if (error) {
                console.error(error);
                return response.status(500).json({
                    message: "서버 내부 오류입니다."
                });
            } else if(result.affectedRows === 0) {
                //이럴 확률은 거의 없긴함.
                return response.status(409).json({
                    message: "전화번호나 가게 아이디를 확인해주세요."
                })
            } else {
                return response.status(200).json({
                    message: "손님 호출 완료!"
                });
            }
        });
    })

})
//대기열 삭제
// 2가지 분기 (회원 vs 비회원)
// 비회원 -> 그냥 삭제 바로해보리기
// 회원 -> called_time null check (구두로 예약 취소) or 정상 가게 이용 or No Show
router.delete('/:id', (request, response) => {
    if(!request.body.phone) {
        return response.status(400).json({
            message: "잘못된 요청입니다."
        });
    }

    waitingCustomerModel.findOne({
            where : {phone: request.body.phone}
        })
    .then(waitingCustomer => {
        if (!waitingCustomer.is_member || !waitingCustomer.called_time) {
            return waitingCustomer.destroy
        } else {
        //    여기에 No_Show vs 정상 가게 이용 구분.
        }
    })
    .then( destroyResult=> {
        console.log(destroyResult);
        return response.status(200).json({
            message: "대기열에서 삭제 완료!"
        });
    })


    const storeId = request.params.id;
    const sql = 'DELETE FROM waiting_customer WHERE store_id = ? AND phone=? LIMIT 1';
    //DML (INSERT, DELETE 는 결과가 한 행으로나옴)
    getPoolConnection(connection=>{
        connection.execute(sql, [storeId, waitingCustomerPhone], (error, result) => {
            connection.release();
            if (error) {
                console.error(error);
                return response.status(500).json({
                    message: "서버 오류입니다."
                });
            } else if(result.affectedRows === 0) {
                return response.status(409).json({
                    message: "전화번호나 가게 아이디를 확인해주세요."
                })
            } else {
                return response.status(200).json({
                    message: "대기열에서 삭제 완료"
                });
            }
        });
    });

});

module.exports = router;