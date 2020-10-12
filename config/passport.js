
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
    done(null, user.id);
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
    dbConnection().query(sql, [userId], (error, row)=> {
        done(error, user);
    });
});

//usernameField - Optional, defaults to 'username'
// passwordField - Optional, defaults to 'password'
// Both fields define the nameof the properties in the POST body that are sent to the server.

passport.use('local-login', new LocalStrategy({
    userIdField : 'userId',
    passwordField : 'password',
    passRequestToCallback : true
    }, function(request, userId, password, done) {
        //The simplest form of .query() is .query(sqlString, callback)
        let sql = 'SELECT * FROM MEMBER WHERE id=? AND password=?';
    // The second form .query(sqlString, values, callback) comes when using
        dbConnection().query(sql,[userId, password], (error, row)=> {
            if (error) {
                console.error(error + 'query 결과 없다.');
                return done(error);
            }
            if(row.length === 0) {
                console.log('ID or password is incorrect');
                return done(null, false, {
                    action : 'login',
                    error_message: 'ID or password is incorrect'})
            }
            if (user && user.authenticate(password)) return done(null, row);
            else {
                //여기 해석을 내가해야하는데...
                // request.flash('userId', row.id);
                // request.flash('errors', {login : 'id or password is incorrect'});
                return done(null, false);
            }
        })
    })
);

module.exports = passport;



