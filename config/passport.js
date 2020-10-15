const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const dbConnection = require('../db/db');


// 쿠키 - 세션을 사용하기 위해서 serialize, deserialize 명세가 필수적이다.
// serialize :  login시 DB에서 조회된 customer or store를 어떻게 session에 저장할지 정의하는 부분.
// done: 예약어 메소드로 null, 유저 정보 객체를 넘긴다.
passport.serializeUser(function(user, done) {
    //메소드를 호출하면서 등록한 콜백 함수는 사용자 인증이 성공적으로 진행되었을 때 호출됨
    //done's first parameter: error, not exists error -> null
    // 사용자 인증이 성공적일 때만 호출되므로 error는 당연히 null로 넘긴다.
    console.log('serialize: ' + user);
    done(null, user);
//    user 의 id부분만 세션에 저장한다.
//    앞으로의 request에서는 user.id가 유저를 식별하는 정보가된다.
//    request.user에 저장된다.
});


// deserialize :  request시 session에서 어떻게 object를 생성할 지 정의.
// 사용자 인증 후 요청이 들어올 때마다 호출
// 매번 request마다 user 정보를 db에서 읽어오는 식이라면 user가 변경될 시 정보가 바로 변경되는 대신,
//request 마다 db query 를 날려야한다는 단점 존재.

passport.deserializeUser(function(userId, done) {
    let sql = 'SELECT id FROM MEMBER where id=?'
    console.log('deserialize:' + userId);
    dbConnection().query(sql, [userId], (error, row)=> {
        if (error) done(error, false);
        else done(null, row);
    });
});

//usernameField - Optional, defaults to 'username'
// passwordField - Optional, defaults to 'password'
// Both fields define the nameof the properties in the POST body that are sent to the server.

passport.use('local-login', new LocalStrategy({
    usernameField : 'userId',
    passwordField : 'password',
    passReqToCallback : true
    }, function(request, userId, password, done) {
    console.log('Local Strategy Authentication is conducted!');
    //The simplest form of .query() is .query(sqlString, callback)
    // The second form .query(sqlString, values, callback) comes when using
        const sql = 'SELECT * FROM member WHERE id=? AND pw=?';
        dbConnection().query(sql, [userId, password], (error, rows)=> {
            if (error) {
                throw error;
                console.error(error + 'query 결과 없다.');
                return done(JSON.stringify(error));

            } else if (rows.length === 0) {
                console.log("Can't find any id or password");
                return done(null, false, JSON.stringify({
                    action : 'login',
                    error_message : 'ID or password is incorrect'
                }));
            } else {
                //rows is object type
                //Casting object -> json
                const member = JSON.stringify(rows[0]);
                console.log('passport Login Success!');

                return done(null, member);
            }
            // else {
            //     //여기 해석을 내가해야하는데...
            //     console.log('flash 직전');
            //     request.flash('userId', rows.id);
            //     request.flash('errors', {login : 'id or password is incorrect'});
            //     return done(null, false);
            // }
        })
    })
);

module.exports = passport;




