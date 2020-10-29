const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');
const checkId = require('../db/check_id');
// 이거 sync function 인데 왜 return 을 못받는거 같냐 아
const locationUrl = require('../config/url_setting');


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
                //요청한 storeId가 가입된 아이디가 아닌경우.
                //json response 도 필요함.
                // return response.status(404).render('error', {
                //     message: "요청하신 페이지를 찾을 수 없습니다.",
                //     error : {
                //         message: "헤잇웨잇에 가입된 가게가 아닙니다.",
                //         status: 404,
                //         stack: null
                //     }
                // });
                return response.status(404).json({
                    message: "헤잇웨잇에 가입된 가게가 아닙니다."
                });
            } else {
                const sql = 'SELECT phone, name, people_number, is_called FROM waiting_customer WHERE store_id=?';
                dbConnection().execute(sql, [storeId], (error, rows)=> {
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
                        })
                    }
                });
            }
        });
});

//대기열 등록
router.post('/:id', (request, response)=> {
    const customerInfo = request.body;
    //is_member 비어있으면 아직 회원인지 아닌지 모르는거임.
    const storeId = request.params.id;
    const sql = 'INSERT INTO waiting_customer VALUES (?, ?, ?, ?, ?, ?)';

    //회원이면 id 정보만 받아옴.
    switch (customerInfo.is_member) {
        case true:
            // 회원 id 로부터 전화번호, 이름 얻어옴
            const memberSql = 'SELECT phone, name FROM member where id=?'
            dbConnection().execute(memberSql, [customerInfo.id], (error, rows)=> {
                if(error) {
                    console.error(error);
                    return response.status(500).json({
                        message: "서버 오류입니다."
                    })
                } else if(rows.length === 0) {
                    return response.status(409).json({
                        message: "아이디를 확인해주세요."
                    })
                } else {

                    const memberPhone = rows[0].phone
                    const memberName = rows[0].name
                    dbConnection().execute(sql, [memberPhone, storeId, memberName, customerInfo.people_number, null, customerInfo.is_member], (error, result)=> {
                        if(error) {
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
                            dbConnection().execute(countSql, [storeId], (error, rows) => {
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
                    });
                }
            });
            break;
        //    비회원인 경우
        case false:
            dbConnection().execute(sql, [customerInfo.phone, storeId, customerInfo.name, customerInfo.people_number, customerInfo.is_member], (error, result)=> {
                if(error) {
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
                    dbConnection().execute(countSql, [storeId], (error, rows) => {
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
            break;
        default:
            console.log('이상하다 여기까지 코드오면 안되는데?');
            return response.status(520).json({
                message: "알 수 없는 오류입니다. 개발자를 욕해주세요"
            });
            break;
    }

});

//대기열 삭제
router.delete('/:id', (request, response) => {
    const waitingCustomerPhone = request.body.phone;
    const storeId = request.params.id;
    const sql = 'DELETE FROM waiting_customer WHERE store_id = ? AND phone=?';
    //DML (INSERT, DELETE 는 결과가 한 행으로나옴)
    dbConnection().execute(sql, [storeId, waitingCustomerPhone], (error, result) => {
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

module.exports = router;