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
        // id가 입력되지 않으면 missing credentials 에러가 옴.

        await storeModel.findOne({
            where: {id: id}
        })
            .then(store=>{
                // 그 어느 docs 에도 나와있지 않지만
                // done 3rd parameter must be object (Number , String 비허용)
                if(!store) {
                    return done(null, false, {code : 404});
                } else if (bcrypt.compareSync(pw, store.pw)) {
                    return done(null, store)
                } else {
                    return done(null, false, {code : 409});
                }
            })
            .catch(error=>{
                return done(error);
            });
    }

    passport.use(new LocalStrategy(localOption, localAuthentication))

}



function passport_jwt_initialize(passport){
    //http://www.passportjs.org/packages/passport-jwt/#extracting-the-jwt-from-the-request
    // customizing jwtFormRequest ('cookie!!')
    const cookieExtractor = function(request) {
        if (request && request.cookies) {
            return request.cookies['jwt'];
        } else {
            throw new Error("don't has json web token for login");
        }
    }

    //this is used for verify json web token (not sign, issue the token)
    // form header -> cookie

    // 이 옵션만으로 자동으로 expiration 검사도 해줌. (expiration -> verify function X, throw 'Token Expiration Error'
    const jwtOption = {
        jwtFromRequest : cookieExtractor,
        algorithms: ['RS256'],
        secretOrKey : fs.readFileSync(path.join(__dirname, 'id_rsa_public.pem'), 'utf8')
    }

    //default behavior : check the 'TokenExpiredError'
    async function jwtAuthentication(jwt_payload, done) {
        console.log(`==========jwt_payload=======`);
        console.dir(jwt_payload);

        storeModel.findOne({
            where: {id: jwt_payload.id}
        }).then(store => {
            // if findOne result not exist => return null
            if(!store) return done(null, false, {code: 404});
            else return done(null, store);
        }).catch(error=>{
            console.error('jwt passport error : ' , error);
            return done(error);
        });
    }

    passport.use(new JwtStrategy(jwtOption, jwtAuthentication));
}

module.exports = {
    passport_local_initialize : passport_local_initialize,
    passport_jwt_initialize : passport_jwt_initialize
}

