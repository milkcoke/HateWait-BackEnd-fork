const express = require('express');
const router = express.Router();
const dbConnection = require('../db/db');

// 이거 sync function인데 왜 return을 못받는거 같냐 아
function checkStoreId(storeId) {
    const sql = 'SELECT id FROM store WHERE id=?';
    dbConnection().execute(sql, [storeId], (error, rows) => {
        if(error) {
            return error;
        } else if(rows[0].length === 0) {
            return null;
        } else {
            return storeId;
        }
    });
}

// 대기열 정보도 다른 가게에서 알 수 없게 session-cookie 인증이 필요함.
router.get('/:id', (request, response)=> {
    // request.params.id
     const storeId = checkStoreId(request.params.id);
     console.log('아아아아');
    if (typeof storeId instanceof Error) {
        console.error(storeId);
        console.log('아이디 체크중 서버오류');
        return response.status(500).json({
            message: "서버 오류입니다."
        });
    } else if (typeof storeId == null) {
        console.log('오류 파악중 잘못된 접근');
        response.status(404).render('error', {
            message: "잘못된 접근입니다.",
            error : {
                message: "잘못됐다고 아!",
                status: 404,
                stack: null
            }
        });
    }

        const sql = 'SELECT name, people_number FROM waiting_customer WHERE store_id=?';
        dbConnection().execute(sql, [request.params.id], (error, rows)=> {
            if (error) {
                console.error(error);
                return response.status(500).json({
                    message: "서버 오류입니다."
                });
            } else if(rows.length == 0) {
                return response.status(200).json({
                    message: "아무런 손님이 없어요",
                    number: 0
                });
            } else {
                return response.status(200).json({
                    message: "조회 성공!",
                    waiting_customers: rows
                })
            }
        });
});

router.post('/:id', (request, response)=> {
    const customerInfo = request.body;

    console.log(customerInfo);
    const storeId = request.params.id;

    const sql = 'INSERT INTO waiting_customer VALUES (?, ?, ?, ?, ?)';
    dbConnection().execute(sql, [customerInfo.phone, storeId, customerInfo.name, customerInfo.people_number, customerInfo.is_member], (error, result)=> {
        if (error) {
            console.error(error);
            return response.status(500).json({
                message: "서버 내부 오류입니다."
            });
        } else {
            const countSql = 'SELECT COUNT(*) as turnNumber FROM waiting_customer WHERE store_id=?'
            dbConnection().execute(countSql, [request.params.id], (error, rows) => {
                // ER_DUP_ENTRY : PRIMARY CONSTRAINT 에러 , 여기선 이미 등록된 전화번호
                if (error.code == 'ER_DUP_ENTRY') {
                    console.error(error.message)
                    return response.status(409).json({
                        message: "이미 등록된 회원입니다."
                    });
                } else if(error) {
                    console.error(error);
                    return response.status(500).json({
                        message: "내부 서버 오류입니다."
                    });
                } else {
                        console.log(rows[0].turnNumber);
                        return response.status(200).json({
                            message: `${rows[0].turnNumber} 번째 회원으로 등록되었습니다!`,
                            count : rows[0].turnNumber
                        });
                    }


            });
        }
    });
});

router.delete('/:id', (request, response) => {
    const waitingCustomerPhone = request.body.phone;
    const storeId = request.params.id;
    const sql = 'DELETE FROM waiting_customer WHERE store_id = ? AND phone=?';
    //DML (INSERT, DELETE 는 결과가 한 행으로나옴)
    dbConnection().execute(sql, [storeId, waitingCustomerPhone], (error, result) => {
        if (error) {
            console.error(error);
            return response.status(500).json({
                message: "서버 내부 오류입니다."
            });
        } else if(result.affectedRows === 0) {
            return response.status(409).json({
                message: "전화번호나 가게 id를 확인해주세요."
            })
        } else {
            return response.status(200).json({
                message: "대기열에서 삭제 성공!"
            });
        }
    });

})

module.exports = router;