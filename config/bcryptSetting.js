const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
const SALT = bcrypt.genSaltSync(SALT_ROUNDS);

module.exports = {bcrypt : bcrypt,
                SALT_ROUNDS : SALT_ROUNDS,
                SALT : SALT}