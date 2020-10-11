
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const dbConnection = require('../db/db');


// serialize :  login시 DB에서 조회된 customer or store를 어떻게 session에 저장할지 정의하는 부분.
// done: 예약어 메소드로 null, 유저 정보 객체를 넘긴다.
passport.serializeUser(function(user, done) {
    //메소드를 호출하면서 등록한 콜백 함수는 사용자 인증이 성공적으로 진행되었을 때 호출됨
    //done's first parameter: error, not exists error -> null
    done(null, user.id);
});


// deserialize :  request시 session에서 어떻게 object를 생성할 지 정의.
// 사용자 인증 후 요청이 들어올 때마다 호출
// 매번 request마다 user 정보를 db에서 읽어오는 식이라면 user가 변경될 시 정보가 바로 변경되는 대신,
//request 마다 db query 를 날려야한다는 단점 존재.

passport.deserializeUser(function(user_id, done) {
    dbConnection().query('SELECT id FROM CUSTOMER where id=user_id', (error, row)=> {
        done(error, user);
    });
});

passport.use('local-login', new LocalStrategy({
    userIdField : 'id',
    passwordField : 'password',
    passRequestToCallback : true
    }, function(request, userId, password, done) {
        dbConnection().query('SELECT id FROM CUSTOMER WHERE id=userId', (error, row)=> {
            if (error) return done(error);
            if (user && user.authenticate(password)) return done(null, row);
            else {
                request.flash('userId', row.id);
                request.flash('errors', {login : 'id or password is incorrect'});
                return done(null, false);
            }
        })
    })
);

module.exports = passport;




