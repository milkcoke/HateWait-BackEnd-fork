
//향상된 보안을 위하여 Sequelize.Op를 사용하고, 문자로 된 별칭은 절대로 사용하지 않을 것.
//operatorAliases false 는 SQL Injection 을 방지하기 위함.

module.exports = {
    database : process.env.DB_DBNAME,
    username : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
    host : process.env.DB_HOSTNAME,
    dialect : 'mysql',
    port : process.env.DB_PORT,
    timestamps : false,
    charset : 'utf8',
    operatorsAliases : false
}