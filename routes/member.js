const express = require('express');
const router = express.Router();
const couponRouter = require('./coupon');
const waitingCustomersRouter = require('./waiting_customer');
const getPoolConnection = require('../db/dbConnection');
const blurOutName = require('../function/blur_out_name');
const isValidToken = require('../function/jwt_authentication_middleware');
const isValidRequest = require('../function/is_valid_token_request_middleware');

router.use((request, response, next)=>{
    request.userType = 'member';
    next();
});

// 회원 정보 조회
router.get('/:id', isValidToken, isValidRequest, (request, response) => {
    const errorRespond = (error)=>{
        console.error(error);
        return response.status(500).json({
            message: "서버 내부 오류입니다."
        });
    }

    const memberId = request.params.id;
    const sql = 'SELECT id, name, phone, email, no_show FROM MEMBER WHERE id=?';
    getPoolConnection(connection=>{
        connection.execute(sql,[memberId], (error, rows) => {
            connection.release();
            if (error) {
                errorRespond(error);
            } else if(rows.length === 0) {
                  return response.status(404).json({
                  message : "아이디를 확인해주세요!"
                  });
            } else {
                return response.status(200).json({
                    memberInformation: rows[0]
                });
            }
        });
    });
});

// in Tablet, member id check, return member Name
// 아이디 -> 이름 요청을 GET 으로 할 경우 로그인 과정이 앞에 없기 때문에 보안에 너무 취약함
// 예외적으로 post 메소드로 처리.
router.post('/name', (request, response) => {
    const errorRespond = (error)=>{
        console.error(error);
        return response.status(500).json({
            message: "서버 내부 오류입니다."
        });
    }

    const memberId = request.body.id;
    const sql = 'SELECT name FROM member where id=?';
    getPoolConnection(connection=>{
        connection.execute(sql, [memberId], (error, rows) => {
            connection.release();
            if (error) {
                errorRespond(error);
            } else if(rows.length === 0) {
                return response.status(409).json({
                    message: "아이디를 확인해주세요."
                })
            } else {
                const blurredOutName = blurOutName(rows[0].name)
                return response.status(200).json({
                    memberName: blurredOutName
                });
            }
        });
    });
});


router.use('/:memberId/coupons', isValidToken, isValidRequest, couponRouter);
router.use('/:memberId/waiting-customers', isValidToken, isValidRequest, waitingCustomersRouter)
module.exports = router;