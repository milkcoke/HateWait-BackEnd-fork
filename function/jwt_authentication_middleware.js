const fs = require('fs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const path = require('path');

module.exports = function authenticationToken(request, response, next){
    passport.authenticate('jwt', {session: false}, (error, store)=>{

        //    verify the accessToken
        //    token comes from the header
        //    object key name is auto transformed from Upper case to lower case
        const authorizationHeader = request.headers['authorization'];
        const token = authorizationHeader && authorizationHeader.split(' ')[1];

        if(token === null) return response.sendStatus(401);

        jwt.verify(token, fs.readFileSync(path.join(__dirname, '..','config', 'id_rsa_public.pem'), 'utf8'),{algorithm: 'RS256'}, (error, store)=>{
            if(error) {
                console.error(error);
                return response.status(403).json({message : "your token is no longer valid"});
            }
            request.user = store;
            next();
        });
    })(request, response);
}