const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const storeModel = require('../models').store;

const memberModel = require('../models').member;

const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

function passport_local_initialize(passport) {
    const localOption = {
        usernameField: 'id',
        passwordField: 'pw'
    }
    // if user don't input id or pw => server automatically response code '401'
    // it's implements of passport
    async function localAuthentication(id, pw, done) {
        // user 객체를 Id 를 통해 받아온거임 (당연히 로그인 성공해야 받아오겠지)
        storeModel.findOne({
            where: {id: id}
        })
            .then(async store=>{
                if(!store) {
                    return done(null, false, {message: '헤잇웨잇에 가입되지 않은 아이디입니다.'});
                //    이부분 불안요소긴해.
                } else if (await bcrypt.compare(pw, store.pw)) {
                    return done(null, store)
                } else {
                    return done(null, false, {message: "비밀번호가 일치하지 않습니다."});
                }
            })
            .catch(error=>{
                return done(error);
            });
    }

    passport.use(new LocalStrategy(localOption, localAuthentication))

}

function passport_jwt_initialize(passport){
    //this is used for verify json web token (not sign, issue the token)
    const jwtOption = {
        jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
        algorithms: ['RS256'],
        secretOrKey : fs.readFileSync(path.join(__dirname, 'id_rsa_public.pem'), 'utf8')
    }
    async function jwtAuthentication(jwt_payload, done) {
        storeModel.findOne({
            where: {id: jwt_payload.id}
        }).then(store => {
            // if findOne result not exist => return null
            if(!store) return done(null, false);
            else return done(null, store);
        }).catch(error=>{
            return done(error);
        });
    }

    passport.use(new JwtStrategy(jwtOption, jwtAuthentication));
}

module.exports = {
    passport_local_initialize : passport_local_initialize,
    passport_jwt_initialize : passport_jwt_initialize
}

