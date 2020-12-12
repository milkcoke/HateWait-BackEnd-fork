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
const twilioSetting = require('../config/twilio_setting');
const sms = require('twilio')(twilioSetting.accountSid, twilioSetting.authenticationToken);
const registerSession = require('../function/register_session_at_server_middleware');
const notifyToAllStoreClient = require('../function/crud_waiting_customers');

//손님이 대기열 조회할 때
router.get('/', (request, response,next)=> {
    const errorRespond = (error)=>{
        console.error(error);
        return response.status(500).json({
            message: "서버 내부 오류입니다."
        });
    }
    // request.params.id
    // 가게아이디가 담겨있을 경우
    if(request.params.hasOwnProperty('storeId')) {
        console.log(`this request is from store : ${request.params.storeId}`);
        next();
        return;
    }

    const memberId = request.params.memberId;
    checkId.member(memberId)
        .catch(errorRespond)
        .then(resultId => {
            if (resultId === null) {
                return response.status(404).json({
                    message: "헤잇웨잇에 가입된 손님이 아닙니다."
                });
            } else {
                const sql = `SELECT member.name AS memberName, member.phone AS memberPhone, waiting_customer.store_id AS storeId, store.name AS storeName
                                FROM member JOIN waiting_customer USING(phone)
                                    INNER JOIN store ON store.id=waiting_customer.store_id
                            WHERE member.id=?`;

                getPoolConnection(connection=>{
                    //1차 쿼리
                    connection.execute(sql, [memberId], (error, rows)=> {
                        // connection.release();
                        if (error) {
                            connection.release();
                            errorRespond(error);
                        } else if(rows.length === 0) {
                            connection.release();
                            return response.status(200).json({
                                message: "대기중인 가게가 없습니다!"
                            });
                        } else {
                            //2차 쿼리에서 순서 번호를 알아냄. (MySQL 에서는 rowNumber 를 제공하지 않아서 쿼리 이후 찾는 과정 필요)
                            const {storeName, memberName, memberPhone, storeId} = rows[0];
                            const getTurnNumberSql = `SELECT turnNumber
                                                        FROM (SELECT phone, @rownum := @rownum+1 AS turnNumber
                                                                FROM waiting_customer, (SELECT @rownum :=0) AS R
                                                                WHERE store_id=?
                                                                ORDER BY reservation_time ASC) AS waiting_customer
                                                        WHERE waiting_customer.phone=?`;
                            connection.execute(getTurnNumberSql,[storeId, memberPhone], (error, rows)=>{
                                connection.release();
                                if (error) {
                                    errorRespond(error);
                                } else {
                                    if(rows.length === 0) console.log('아니 어떻게 이게 안나와?');
                                    return response.status(200).json({
                                        store_name : storeName,
                                        member_name : memberName,
                                        turn_number : rows[0].turnNumber
                                    });
                                }
                            });
                        }
                    });
                });
/*
                const getStoreNameSql = `SELECT store.name AS storeName, member.name AS memberName, tb.turnNumber
                                         FROM waiting_customer INNER JOIN store ON waiting_customer.store_id = store.id
                                                            INNER JOIN member ON member.phone = waiting_customer.phone
                                                            JOIN (SELECT phone, NAME, @rownum := @rownum+1 AS turnNumber
                                                                    FROM waiting_customer, (SELECT @rownum :=0) AS R
                                                                    ORDER BY reservation_time ASC) AS tb ON member.phone = tb.phone
                                         WHERE member.id=? LIMIT 1`;
 */
                    // WHERE store_id='gore' 만 도중에 추가하면 되는데 아 ㄹㅇ
                // 서브쿼리 너무 길다 인간적으로
            }
        });
});



global.storeMap = new Map();

// 대기열 정보도 다른 가게에서 알 수 없게 session-cookie 인증이 필요함.
// 가게별 대기열 조회
router.get('/', registerSession, (request, response)=> {
    // request.params.id
     const storeId = request.params.storeId;
     const errorRespond = (error)=>{
        console.error(error);
        return response.status(500).json({
            message: "서버 내부 오류입니다."
        });
     }
    console.log("------I'm in after registerSession------");

    // 최초 1회 대기열 정보 알려줌.
    const sql = `SELECT phone, name, people_number, called_time
                             FROM waiting_customer
                             WHERE store_id = ?
                             ORDER BY reservation_time ASC`;

     getPoolConnection(connection=>{
        connection.execute(sql, [storeId], (error, rows)=> {
            connection.release();
            if (error) {
                errorRespond(error);
            } else if (rows.length === 0) {
                // return response.status(200).json({
                //     message: "지금은 손님이 없어요"
                // });
                response.write(`event: read\n`);
                response.write(`${JSON.stringify({message: '지금은 손님이 없어요'})}\n\n`);
            } else {
                // return response.status(200).json({
                //     waiting_customers: rows
                // });
                response.write(`event: read\n`);
                response.write(`${JSON.stringify({waiting_customers: rows})}\n\n`);

            }
        });
    });
     /*
     // 로그인해서 토큰을 발급받지 않으면 여기까지 올 수도 없음.
     checkId.store(storeId)
         .catch(errorRespond)
         .then(resultId => {
            if (resultId === null) {
                return response.status(404).json({
                    message: "헤잇웨잇에 가입된 가게가 아닙니다."
                });
            } else {
                const sql = `SELECT phone, name, people_number, called_time
                             FROM waiting_customer
                             WHERE store_id = ?
                             ORDER BY reservation_time ASC`;

                getPoolConnection(connection=>{
                    connection.execute(sql, [storeId], (error, rows)=> {
                        connection.release();
                        if (error) {
                            errorRespond(error);
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

      */
});

//대기열 등록 (비회원 - 회원)
router.post('/', (request, response)=> {
    const customerInfo = request.body;
    //is_member 비어있으면 아직 회원인지 아닌지 모르는거임.
    const storeId = request.params.storeId;
    const sql = `INSERT INTO waiting_customer VALUES (?, ?, ?, ?, NULL, NULL, ?)`;

    const errorRespond = (error)=>{
        console.error(error);
        return response.status(500).json({
            message: "서버 내부 오류입니다."
        });
    }

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
                        errorRespond(error);
                    } else if(rows.length === 0) {
                        connection.release();
                        return response.status(409).json({
                            message: "아이디를 확인해주세요."
                        });
                    } else {
                        const {phone: memberPhone, name: memberName} = rows[0];
                        // const memberPhone = rows[0].phone
                        // const memberName = rows[0].name
                        connection.execute(sql, [memberPhone, storeId, memberName, customerInfo.people_number, customerInfo.is_member], (error)=>{
                            if(error) {
                                connection.release();
                                if (error.code === 'ER_DUP_ENTRY') {
                                    console.error(error.message);
                                    return response.status(409).json({
                                        message: "이미 대기열에 등록된 회원입니다."
                                    });
                                } else {
                                    errorRespond(error);
                                }
                            } else {
                                // Error 가 존재하지 않으면
                                const countSql = 'SELECT COUNT(*) as turnNumber FROM waiting_customer WHERE store_id=?';
                                connection.execute(countSql, [storeId], (error, rows) => {
                                    connection.release();
                                    // ER_DUP_ENTRY : PRIMARY CONSTRAINT 에러 , 여기선 이미 등록된 전화번호
                                    if(error) {
                                        errorRespond(error);
                                    } else {

                                        //phone, name, people_number, called_time
                                        notifyToAllStoreClient.add(storeId, {
                                            name: memberName,
                                            phone: memberPhone,
                                            people_number: customerInfo.people_number,
                                            called_time : null
                                        });

                                        // 손님 새로 등록할 때마다 현재 대기 인원 증가
                                        // broadcast(request.app.locals.clients, `현재 대기 인원 : ${rows[0].turnNumber}명`);
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
                const {phone : nonMemberPhone, name : nonMemberName, people_number : nonMemberPeopleNumber} = customerInfo;

                connection.execute(sql, [nonMemberPhone, storeId,nonMemberName, nonMemberPeopleNumber, customerInfo.is_member], (error, result)=> {
                    if(error) {
                        connection.release();
                        if (error.code === 'ER_DUP_ENTRY') {
                            console.error(error.message);
                            return response.status(409).json({
                                message: "이미 대기열에 등록된 회원입니다."
                            });
                        } else {
                            errorRespond(error);
                        }
                    } else {
                        const countSql = 'SELECT COUNT(*) as turnNumber FROM waiting_customer WHERE store_id=?'
                            connection.execute(countSql, [storeId], (error, rows) =>{
                                connection.release();
                                // ER_DUP_ENTRY : PRIMARY CONSTRAINT 에러 , 여기선 이미 등록된 전화번호
                                if(error) {
                                    errorRespond(error);
                                } else {
                                    delete customerInfo['is_member'];
                                    notifyToAllStoreClient.add(storeId, {
                                        phone: nonMemberPhone,
                                        name: nonMemberName,
                                        people_number: nonMemberPeopleNumber,
                                        called_time : null
                                    });

                                    return response.status(201)
                                        .location(locationUrl.storeURL + `${storeId}/` + 'waiting-customers')
                                        .json({
                                        name: nonMemberName,
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
    }

});
// 가게에서  손님 호출.
router.patch('/', (request, response)=> {
    //phone (전화번호) 만 받으면 됨.
    //Destructuring!
    const [storeId, customerPhone = null] = [request.params.storeId, request.body.phone];

    const errorRespond = (error)=>{
        console.error(error);
        return response.status(500).json({
            message: "서버 내부 오류입니다."
        });
    }

    if (!customerPhone) {
        return response.status(400).json({
            message: "잘못된 요청입니다."
        });
    }

    const sql = `UPDATE waiting_customer SET called_time=NOW() WHERE phone=? LIMIT 1`;
    getPoolConnection(connection=>{
        connection.execute(sql, [customerPhone], (error, result)=> {
            if (error) {
                errorRespond(error);
            } else if(result.length === 0) {
                //이럴 확률은 거의 없긴함.
                return response.status(409).json({
                    message: "전화번호나 가게 아이디를 확인해주세요."
                })
            } else {
                const getCalledTimeAndTurnNumberSQL = `SELECT waiting_customer.called_time AS called_time,
                                                              waiting_customer.phone       AS phone,
                                                              tb.turnNumber                AS turnNumber,
                                                              store.name                   AS storeName
                                                       FROM waiting_customer
                                                                JOIN (
                                                           SELECT phone, @rownum := @rownum + 1 AS turnNumber
                                                           FROM waiting_customer,
                                                                (SELECT @rownum := 0) AS R
                                                           WHERE store_id = ?
                                                           ORDER BY reservation_time) AS tb USING (phone)
                                                                JOIN store ON store.id = waiting_customer.store_id
                                                       WHERE waiting_customer.phone = ?`;
                connection.promise().execute(getCalledTimeAndTurnNumberSQL, [storeId, customerPhone])
                    .then(([rows,fields])=>{
                        connection.release();
                        // 한국 country code 82 추가
                        sms.messages.create({
                            to: `+82${rows[0].phone}`,
                            from : twilioSetting.fromPhone,
                            body : twilioSetting.messageHeader + `${rows[0].turnNumber}번째 차례입니다. ${rows[0].storeName}로 와주세요!`
                        })
                            .then(()=>{
                                notifyToAllStoreClient.call(storeId, {
                                    phone: customerPhone
                                });
                                return response.status(200).json({
                                    message: "손님 호출 완료!",
                                    called_time : rows[0].called_time
                                });
                            })
                            .catch(error=>{
                                console.error(error);
                                return response.status(500).json({
                                    message : `손님 SMS 호출 실패!\n 서버 내부 오류입니다`
                                });
                            })
                    })
                    .catch(error=>{
                        connection.release();
                        errorRespond(error);
                    });
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
    const errorRespond = (error)=>{
        console.error(error);
        return response.status(500).json({
            message: "서버 내부 오류입니다."
        });
    }
    if(!request.body.phone) {
        return response.status(400).json({
            message: "잘못된 요청입니다."
        });
    }
    const storeId = request.user.id;

    // checkId.store(request.params.storeId)
    //     .catch(errorRespond)
    //     .then(storeId=>{
    //         if(storeId === null) {
    //             return response.status(404).json({
    //                 message: "헤잇웨잇에 가입된 가게가 아닙니다."
    //             })
    //         }
    //         return storeId;
    //     })
    //     .then(storeId=> {
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
                        notifyToAllStoreClient.delete(storeId, {
                            phone : waitingCustomer.phone
                        });
                        return waitingCustomer.destroy()
                        //    비회원이긴 한데 호출된 적 있는 경우
                    } else if (!waitingCustomer.is_member) {
                        // 정상적으로 온 경우
                        if (request.body.visited) {
                            getPoolConnection(connection=>{
                                // 방문 기록
                                connection.execute(visitSql, [storeId, waitingCustomer.people_number], (error)=>{
                                    connection.release();
                                    if(error) {
                                        errorRespond(error);
                                    } else {
                                        // 대기열에서 삭제
                                        notifyToAllStoreClient.delete(storeId, {
                                            phone : waitingCustomer.phone
                                        });
                                        return waitingCustomer.destroy()
                                            .then(()=>{
                                                return response.status(200).json({
                                                    message: "손님 방문 완료!"
                                                });
                                            });
                                    }
                                })
                            });
                        } else {
                            //    정상적으로 오지 않은 경우. (호출되고 빤스런)
                            notifyToAllStoreClient.delete(storeId, {
                                phone : waitingCustomer.phone
                            });

                            waitingCustomer.destroy()
                                .then(()=>{
                                    return response.status(200).json({
                                        message: "손님 대기 삭제 완료!"
                                    });
                                });
                        }
                    } else {
                        //호출된 '회원' 손님 매장 이용 케이스
                        memberModel.findOne({
                            where: {phone: waitingCustomer.phone}
                        })
                            .catch(errorRespond)
                            .then(member=>{
                                //    여기에 No_Show vs 정상 가게 이용 구분.
                                //정상적으로 가게 온 경우
                                if (request.body.visited) {
                                    getPoolConnection(connection=>{
                                        const visitMemberSql = `INSERT INTO visit_log VALUES(NOW(), ?, ?, ?)`;

                                        connection.execute(visitMemberSql, [storeId, waitingCustomer.people_number, member.id], (error, result)=>{
                                            if(error) {
                                                connection.release();
                                                errorRespond(error);
                                            } else {
                                                console.log('삽입된 로우 수 : ', result.affectedRows)
                                                connection.execute(deleteSql, [storeId], (error, result)=>{
                                                    connection.release();
                                                    if(error) {
                                                        errorRespond(error);
                                                    } else {
                                                        notifyToAllStoreClient.delete(storeId, {
                                                            phone : waitingCustomer.phone
                                                        });

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
                                        fields : ['no_show'],
                                        limit: 1
                                    })
                                        .then(numberAndModel=>{
                                            console.log(`affected (no show + 1) Row Number : ${numberAndModel[0]}`);
                                            console.log(`${member.name} 손님 no_show 증가!`);
                                            console.log(`model : ${numberAndModel[1]}`);
                                            return numberAndModel[1].destroy();
                                        })
                                        .then(result=>{
                                            console.log(`result : ${result}`);
                                            console.log(`대기열에서 삭제된 로우 수 : ${result.affectedRows}`);
                                            notifyToAllStoreClient.delete(storeId, {
                                                phone : waitingCustomer.phone
                                            });
                                            return response.status(200).json({
                                                message: "대기열 삭제 완료!"
                                            });
                                        })
                                        .catch(errorRespond);
                                }
                            });
                    }
                })
                .catch(errorRespond)
                .then((deletedRow)=>{
                    // 비회원 삭제임.
                    notifyToAllStoreClient.delete(storeId, {
                        phone : request.body.phone
                    });
                    console.log(`deleted rows : ${deletedRow.affectedRows}`);
                    return response.status(200).json({
                        message: "예약 취소 완료!",
                    });
                });
        // });
});

module.exports = router;