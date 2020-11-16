const Sequelize = require('sequelize');
const express = require('express');
//상위 라우터의 Parameter 를 상속받기 위한 Option
const router = express.Router({mergeParams : true});
const getPoolConnection = require('../db/dbConnection.js');
const checkId = require('../function/check_id');
const locationUrl = require('../config/url_setting');
const models = require('../models');
const waitingCustomerModel = models.waiting_customer;
const memberModel = models.member;
const broadcast = require('../function/broadcast');

//대기열 조회 in 테블릿.
// webSocket Initialize
router.get('/', (request, response,next)=> {
    // request.params.id
    // 가게아이디가 담겨있을 경우
    if(request.params.hasOwnProperty('storeId')) {
        console.log(`1st parameter : ${request.params.storeId}`);
        next();
        return;
    }

    const memberId = request.params.memberId;
    checkId.member(memberId)
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
                    message: "헤잇웨잇에 가입된 손님이 아닙니다."
                });
            } else {

                const getStoreNameSql = `SELECT store.name AS storeName, member.name AS memberName, tb.turnNumber
                                         FROM waiting_customer INNER JOIN store ON waiting_customer.store_id = store.id
                                                            INNER JOIN member ON member.phone = waiting_customer.phone
                                                            JOIN (SELECT phone, NAME, @rownum := @rownum+1 AS turnNumber
                                                                    FROM waiting_customer, (SELECT @rownum :=0) AS R
                                                                    ORDER BY reservation_time ASC) AS tb ON member.phone = tb.phone
                                         WHERE member.id=? LIMIT 1`;

                    getPoolConnection(connection=>{
                    connection.execute(getStoreNameSql, [memberId], (error, rows)=> {
                        connection.release();
                        if (error) {
                            console.error(error);
                            return response.status(500).json({
                                message: "서버 오류입니다."
                            });
                        } else if(rows.length === 0) {
                            return response.status(200).json({
                                message: "대기중인 가게가 없습니다!"
                            });
                        } else {
                            return response.status(200).json({
                                store_name : rows[0].storeName,
                                member_name : rows[0].memberName,
                                turn_number : rows[0].turnNumber
                            });
                        }
                    });
                });
            }
        });
});



// 대기열 정보도 다른 가게에서 알 수 없게 session-cookie 인증이 필요함.
//대기열 조회
// 가게에 대한 정보임.
router.get('/', (request, response)=> {
    // request.params.id
     const storeId = request.params.storeId;
     console.log(`2nd store id : ${storeId}`)
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
                const sql = `SELECT phone, name, people_number, called_time 
                            FROM waiting_customer WHERE store_id=?
                            ORDER BY reservation_time ASC`;
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

//대기열 등록 (비회원 - 회원)
// where connection release issue ㅠ_ㅠ
router.post('/', (request, response)=> {
    const customerInfo = request.body;
    //is_member 비어있으면 아직 회원인지 아닌지 모르는거임.
    const storeId = request.params.storeId;
    const sql = `INSERT INTO waiting_customer VALUES (?, ?, ?, ?, NULL, NULL, ?)`;

    //회원이면 id 정보만 받아옴.
    switch (customerInfo.is_member) {
        case true:
            if(!customerInfo.hasOwnProperty('member_id') ||!customerInfo.hasOwnProperty('people_number') || !customerInfo.hasOwnProperty('is_member')) {
                return response.status(400).json({
                    message : "잘못된 요청입니다."
                });
            }

            const memberSql = 'SELECT phone, name FROM member where id=?';
            getPoolConnection(connection=>{
                // 회원 id 로부터 전화번호, 이름 얻어옴 (이름부터 조회)
                connection.execute(memberSql, [customerInfo.member_id], (error, rows)=> {
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
                        connection.execute(sql, [memberPhone, storeId, memberName, customerInfo.people_number, customerInfo.is_member], (error, result)=>{
                            if(error) {
                                connection.release();
                                if (error.code === 'ER_DUP_ENTRY') {
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
                                        // 손님 새로 등록할 때마다 현재 대기 인원 증가
                                        broadcast(request.app.locals.clients, `현재 대기 인원 : ${rows[0].turnNumber}명`);
                                        return response.status(201)
                                            .location(locationUrl.storeURL + `${storeId}/` + 'waiting-customers')
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
            if (!customerInfo.hasOwnProperty('phone') || !customerInfo.hasOwnProperty('name') ||
                !customerInfo.hasOwnProperty('people_number') || !customerInfo.hasOwnProperty('is_member')) {
                return response.status(400).json({
                    message: "잘못된 요청입니다."
                });
            }
            getPoolConnection(connection=>{
                console.log(customerInfo);
                connection.execute(sql, [customerInfo.phone, storeId, customerInfo.name, customerInfo.people_number, customerInfo.is_member], (error, result)=> {
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
                                    broadcast(request.app.locals.clients, `현재 대기 인원 : ${rows[0].turnNumber}명`);
                                    return response.status(201)
                                        .location(locationUrl.storeURL + `${storeId}/` + 'waiting-customers')
                                        .json({
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
router.patch('/', (request, response)=> {
    //phone (전화번호) 만 받으면 됨.
    if (!request.body.phone) {
        return response.status(400).json({
            message: "잘못된 요청입니다."
        });
    }

    const sql = `UPDATE waiting_customer SET called_time=NOW() WHERE phone=? LIMIT 1`;
    getPoolConnection(connection=>{
        connection.execute(sql, [request.body.phone], (error, result)=> {
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
                const getCalledTimeSql = `SELECT called_time FROM waiting_customer WHERE phone=?`;
                connection.promise().execute(getCalledTimeSql, [request.body.phone])
                    .then(([rows,fields])=>{
                        connection.release();
                        console.log(rows);
                        return response.status(200).json({
                            message: "손님 호출 완료!",
                            called_time : rows[0].called_time
                        });
                    })
                    .catch(error=>{
                        connection.release();
                        console.error(error);
                        return response.status(500).json({
                            message : "서버 내부 오류입니다."
                        });
                    });
                // connection.execute(getCalledTimeSql, [request.body.phone])

            }
        });
    })
})
//대기열 삭제
// request body : phone, visited
// 2가지 분기 (회원 vs 비회원)
// 비회원 -> 그냥 삭제 바로해보리기
// 회원 -> called_time null check (구두로 예약 취소) or 정상 가게 이용 or No Show
router.delete('/', (request, response) => {
        if(!request.body.phone) {
            return response.status(400).json({
            message: "잘못된 요청입니다."
        });
    }
    checkId.store(request.params.storeId)
        .catch(error=>{
            return response.status(500).json({
                message: "서버 내부 오류입니다."
            });
        })
        .then(storeId=>{
            if(storeId === null) {
                return response.status(404).json({
                    message: "헤잇웨잇에 가입된 가게가 아닙니다."
                })
            }
            return storeId;
        })
        .then(storeId=> {
            // (비회원 or 구두 대기 취소) vs (No_Show vs 정상 이용 가게)
                waitingCustomerModel.findOne({
                    where : {phone: request.body.phone}
                })
                    .then(waitingCustomer => {
                        const visitSql = `INSERT INTO visit_log VALUES(NOW(), ?, ?, NULL)`;
                        const deleteSql = `DELETE FROM waiting_customer WHERE phone = ?`;

                        if (waitingCustomer === null) {
                            return response.status(404).json({
                                message : "대기열에 존재하지 않는 손님입니다."
                            });
                        } else if (!waitingCustomer.called_time) {
                            // 비회원 및 현장 대기 취소 케이스
                            console.log('호출된 적 없음!');
                            return waitingCustomer.destroy()
                        //    비회원이긴 한데 호출된 적 있는 경우
                        } else if (!waitingCustomer.is_member) {
                            // 정상적으로 온 경우
                            if (request.body.visited) {
                                getPoolConnection(connection=>{
                                    // 방문 기록
                                    connection.execute(visitSql, [storeId, waitingCustomer.people_number], (error, result)=>{
                                        connection.release();
                                        if(error) {
                                            console.error(error);
                                            return response.status(500).json({
                                                message: "서버 내부 오류입니다."
                                            });
                                        } else {
                                            // 대기열에서 삭제
                                            return waitingCustomer.destroy()
                                        }
                                    })
                                })
                            } else {
                            //    정상적으로 오지 않은 경우. (호출되고 빤스런)
                                return waitingCustomer.destroy()
                            }
                        } else {
                            //호출된 '회원' 손님 매장 이용 케이스
                            memberModel.findOne({
                                where: {phone: waitingCustomer.phone}
                            })
                            .catch(error=>{
                              return response.status(500).json({
                                  message: "서버 내부 오류입니다."
                              });
                            })
                            .then(member=>{
                                //    여기에 No_Show vs 정상 가게 이용 구분.
                                //정상적으로 가게 온 경우
                                if (request.body.visited) {
                                    getPoolConnection(connection=>{
                                        const visitMemberSql = `INSERT INTO visit_log VALUES(NOW(), ?, ?, ?)`;
                                        connection.execute(visitMemberSql, [storeId, waitingCustomerModel.people_number, member.id], (error, result)=>{
                                            if(error) {
                                                connection.release();
                                                return response.status(500).json({
                                                    message: "서버 내부 오류입니다."
                                                });
                                            } else {
                                                console.log('삽입된 로우 수 : ', result.affectedRows)
                                                connection.execute(deleteSql, [storeId], (error, result)=>{
                                                    connection.release();
                                                    if(error) {
                                                        return response.status(500).json({
                                                            message: "서버 내부 오류입니다."
                                                        });
                                                    } else {
                                                        console.log('삭제된 로우 수: ', result.affectedRows)
                                                        return response.status(200).json({
                                                            message: "손님 방문 완료!"
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    });
                                } else {
                                    //No Show 인 경우
                                    //No Show 숫자가 일정 채워지면 제재를 가하긴 해야함.
                                    member.update({
                                        no_show: Sequelize.literal(`no_show + 1`)
                                    }, {
                                        fields : [no_show],
                                        limit : 1
                                    })
                                    .then(numberAndModel=>{
                                        console.log(`inserted Row Number : ${numberAndModel[0]}`);
                                        console.log(`${member.name} 손님 no_show 증가!`);
                                        console.log(`model : ${numberAndModel[1]}`);
                                        return waitingCustomer[1].destroy()
                                    })
                                    .then(result=>{
                                        console.log(`대기열에서 삭제된 로우 수 : ${result.affectedRows}`);
                                        return response.status(200).json({
                                            message: "대기열 삭제 완료!"
                                        });
                                    })
                                    .catch(error=>{
                                        console.error(error);
                                        return response.status(500).json({
                                            message : "서버 내부 오류입니다."
                                        });
                                    });
                                }
                            });
                        }
                    })
                    .catch(error=>{
                        console.error(error)
                        return response.status(500).json({
                            message: "서버 내부 오류입니다."
                        })
                    })
                    .then((deletedRow)=>{
                        // 비회원 삭제임.
                        console.log(`deleted rows : ${deletedRow.affectedRows}`);
                            return response.status(200).json({
                                message: "예약 취소 완료!",
                        });

                    });
    });


});

module.exports = router;