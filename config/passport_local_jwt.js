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
        passwordField: 'pw',
        passReqToCallback: true
    }
    // if user don't input id or pw => server automatically response code '401'
    // it's implements of passport
    async function localAuthentication(request, id, pw, done) {
        // user 객체를 Id 를 통해 받아온거임 (당연히 로그인 성공해야 받아오겠지)
        // id가 입력되지 않으면 missing credentials 에러가 옴.
        // 계정 유형 또한 type(member, store) 으로 명시해야함.
        const userType = request.userType;
        if (!userType) done(null, false, {code : 400, msg: '계정 유형을 선택해주세요'});

        switch (userType) {
            case 'member':
                await memberModel.findOne({
                    where: {id: id}
                })
                    .then(async member=>{
                        // 그 어느 docs 에도 나와있지 않지만
                        // done 3rd parameter must be object (Number , String 비허용)
                        if(!member) {
                            return done(null, false, {code : 404});
                        } else if (await bcrypt.compare(pw, member.pw)) {
                            return done(null, member)
                        } else {
                            return done(null, false, {code : 409});
                        }
                    })
                    .catch(error=>{
                        return done(error);
                    });
                break;
            case 'store':
                await storeModel.findOne({
                    where: {id: id}
                })
                    .then(async store=>{
                        if(!store) {
                            return done(null, false, {code : 404});
                        } else if (await bcrypt.compare(pw, store.pw)) {
                            return done(null, store)
                        } else {
                            return done(null, false, {code : 409});
                        }
                    })
                    .catch(error=>{
                        return done(error);
                    });
                break;
            default :
                done(null, false, {code : 400, msg: '계정 유형을 바르게 입력해주세요'});
                break;
        }

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
            console.error('쿠키 인식 못함.');
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
        const {id, type: userType = null} = jwt_payload;

        switch (userType) {
            case 'member' :
                memberModel.findOne({
                    where: {id: id}
                }).then(member => {
                    // if findOne result not exist => return null
                    if(!member) return done(null, false, {code: 404});
                    else return done(null, [member, userType]);
                }).catch(error=>{
                    console.error('jwt passport error : ' , error);
                    return done(error);
                });
                break;
            case 'store' :
                storeModel.findOne({
                    where: {id: id}
                }).then(store => {
                    // if findOne result not exist => return null
                    if(!store) return done(null, false, {code: 404});
                    else return done(null, [store, userType]);
                }).catch(error=>{
                    console.error('jwt passport error : ' , error);
                    return done(error);
                });
                break;
            default :
                console.log('여기를 왔다고..?');
                done(null, false);
                break;
        }
    }

    passport.use(new JwtStrategy(jwtOption, jwtAuthentication));
}

module.exports = {
    passport_local_initialize : passport_local_initialize,
    passport_jwt_initialize : passport_jwt_initialize
}

