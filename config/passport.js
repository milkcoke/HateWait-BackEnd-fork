const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('./bcrypt_setting');
const dbConnection = require('../db/db');



// 쿠키 - 세션을 사용하기 위해서 serialize, deserialize 명세가 필수적이다.

// serialize :  login시 DB 에서 조회된 customer or store 를 어떻게 session 에 저장할지 정의하는 부분.
//메소드를 호출하면서 등록한 콜백 함수는 사용자 인증이 '성공' 했을때 호출됨
// done: 예약어 메소드로 null, 유저 정보 객체를 넘긴다.
passport.serializeUser(function(storeInfo, done) {

    //done's first parameter: error, not exists error -> null
    // 사용자 인증이 성공적일 때만 호출되므로 error는 당연히 null로 넘긴다.
    console.log('serialize===============');
    for(let key in storeInfo) {
        console.log(key.valueOf());
    }
    console.log('serialize===============');

    //    user 의 id만 세션에 저장한다.
    //    앞으로의 request 에서는 user.id가 유저를 식별하는 정보가된다.
    //    request.user 에 저장된다.
    done(null, storeInfo);
    //second parameter is passed to deserialize method's first argument

});



// 사용자 인증 후 요청이 들어올 때마다 호출
// 매번 request마다 user 정보를 DB 에서 읽어오는 식이라면 user 가 변경될 시 정보가 바로 변경되는 대신,
// request 마다 db query 를 날려야한다는 단점 존재.

passport.deserializeUser(function(storeInfo, done) {
    // userId는 serialize 에서 저장해뒀던 세션 정보로 부터 넘어온 것.


    console.log('=====deserialize User=====');
    for (let key in storeInfo) {
        console.log(key.valueOf());
    }
    console.log('=====deserialize User=====');
    // 현재 세션에 저장된 id와

    const sql = 'SELECT id, name FROM STORE where id=?'
    dbConnection().execute(sql, [storeInfo.id], (error, rows)=> {
        if (error) done(error, false);
        // 여기 done 에서 HTTP request에 req.memberId 를 붙여서 보냄.
        // id만 붙이는게 나을까?
        else {
            done(null, {
                id: rows[0].id,
                name: rows[0].name
            });
        }
    });
});

//usernameField - Optional, defaults to 'username'
// passwordField - Optional, defaults to 'password'
// Both fields define the name of the properties in the POST body that are sent to the server.

passport.use('local-login', new LocalStrategy({
    usernameField : 'id',
    passwordField : 'pw',
    passReqToCallback : true
    }, function(request, id, pw, done) {
        //암호화를 sql 날리기 전에 무조건 수행.

            //The simplest form of .query() is .query(sqlString, callback)
            // The second form .query(sqlString, values, callback) comes when using
            const sql = 'SELECT id, name, phone, pw FROM STORE WHERE id=?';
            dbConnection().execute(sql, [id], (error, rows) => {
                if (error) {
                    throw error;
                    console.error(error + 'query 결과 없다.');
                    return done(error);
                } else if (!rows[0]) {
                    console.log("Can't find store id");
                    return done(null, false, {
                        message: '해당 사용자를 찾지 못했어요.'
                    });
                } else {
                    // 패스워드 검증
                    bcrypt.bcrypt.compare(pw, rows[0].pw)
                    .catch(error => {
                        console.error(error);
                        return done(null, false, {
                            message : "비밀번호 검증 오류!"
                        });
                    })
                    .then(result => {
                        //success
                        if(result) {
                            //2nd parameter is saved at server and
                            //available through request.user property
                            return done(null, {
                                id: rows[0].id,
                                name: rows[0].name
                            }, {
                                message : 'Login Success!'
                            });
                        } else {
                            return done(null, false, {
                                message : '비밀번호가 일치하지 않아요.'
                            })
                        }

                    })

                }
                // else {
                //     //여기 해석을 내가해야하는데...
                //     console.log('flash 직전');
                //     request.flash('userId', rows.id);
                //     request.flash('errors', {login : 'id or password is incorrect'});
                //     return done(null, false);
                // }
            })
    }));




module.exports = passport;




