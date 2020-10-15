const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('../config/bcryptSetting');
const dbConnection = require('../db/db');



// 쿠키 - 세션을 사용하기 위해서 serialize, deserialize 명세가 필수적이다.

// serialize : 로그인시 DB 에서 조회된 customer or store 를 어떻게 session 에 저장할지 정의하는 부분.
//메소드를 호출하면서 등록한 콜백 함수는 사용자 인증이 '성공' 했을때 호출됨
// done: 예약어 메소드로 null, 유저 정보 객체를 넘긴다.
passport.serializeUser(function(memberInfo, done) {

    //done's first parameter: error, not exists error -> null
    // 사용자 인증이 성공적일 때만 호출되므로 error는 당연히 null로 넘긴다.
    console.log('serialize: ' + memberInfo);

    //    user 의 id만 세션에 저장한다.
    //    앞으로의 request 에서는 user.id가 유저를 식별하는 정보가된다.
    //    request.user 에 저장된다.
    done(null, memberInfo);
    //second parameter is passed to deserialize method's first argument

});



// 사용자 인증 후 요청이 들어올 때마다 호출
// 매번 request 마다 user 정보를 DB 에서 읽어오는 식이라면 user 가 변경될 시 정보가 바로 변경되는 대신,
// request 마다 db query 를 날려야한다는 단점 존재.

passport.deserializeUser(function(memberInfo, done) {
    // userId는 serialize 에서 저장해뒀던 세션 정보로 부터 넘어온 것.

    let sql = 'SELECT id FROM MEMBER where id=?'
    console.log('deserialize:' + memberInfo);
    // 현재 세션에 저장된 id와
    dbConnection().query(sql, [memberInfo.id], (error, rows)=> {
        if (error) done(error, false);
        // 여기 done 에서 HTTP request에 req.memberId 를 붙여서 보냄.
        // id만 붙이는게 나을까?
        else done(null, rows[0].id);
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
        //암호화를 sql 날리기 전에 무조건 수행.
        //여기의 bcrypt.SALT 는 genSalt 를 수행하는 promise 객체므로 then, catch 로 받는다.
        bcrypt.SALT
            .then(salt => {
                return bcrypt.bcrypt.hash(password, salt);
            })
            .then((hashedPassword) => {
                console.log('Local Strategy Authentication is conducted!');
                const sql = 'SELECT id, name, phone FROM member WHERE id=? AND pw=?';
                dbConnection().query(sql, [userId, hashedPassword], (error, rows) => {
                    if (error) {
                        throw error;
                        console.error(error + 'query 결과 없다.');
                        return done(JSON.stringify(error));
                    } else if (rows.length === 0) {
                        console.log("Can't find any id or password");
                        return done(null, false, JSON.stringify({
                            action: 'login',
                            error_message: 'ID or password is incorrect'
                        }));
                    } else {
                        //rows is object type
                        //Casting object -> json
                        const memberInfo = rows[0];
                        console.log('passport Login Success!');
                        return done(null, memberInfo);
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
            .catch(err => {
                throw err;
            });
    }));




module.exports = passport;




