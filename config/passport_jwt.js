const passport = require('passport');
// passport-jwt 는 JSON Web Token 방식으로 인증을 수행하는 모듈 (verify Token passing Authentication from Client to Server )
// 최초의 서버 -> 클라이언트로의 Token 발급은 jsonwebtoken 모듈에서 수행한다.
const jwtStrategy = require('passport-jwt').Strategy;
const extractJwt = require('passport-jwt').ExtractJwt;
const jsonwebtoken = require('jsonwebtoken');
const dbConnection = require('../db/db');

// issuer: If defined the token issuer (iss) will be verified against this value.
// fromHeader : creates a new extractor that looks for the JWT in the given http header

//expiresIn ??
const optionsAuthentication = {
    // JSON Web Token 을 Header 로 부터 추출함.
    algorithm : "HS512",
    jwtFromRequest : extractJwt.fromHeader('Access-Token'),
    secretOrKey : 'secret',
    issuer : 'hatewait-server.herokuapp.com',
    audience : 'hatewait-server.herokuapp.com'
}

const optionsTokenIssuance = {
    algorithm : "HS512",
    issuer : 'hatewait-server.herokuapp.com',
    subject: 'storeInfo'
}

passport.use(new jwtStrategy(optionsAuthentication, (jwtPayload, done) => {
    const sql = 'SELECT id, name, phone FROM STORE WHERE id=? AND pw=?';

    dbConnection().query(sql, [jwtPayload.id, jwtPayload.password], (error, rows) => {
        if (error) {
            return done(error, false);
        } else if (rows) {

            return done(null, rows);
        } else {
            return done(null, false);
        }
    });

}));

module.exports = passport;

