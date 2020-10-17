
module.exports = {
    DB_NAME : process.env.DB_DBNAME,
    DB_USER : process.env.DB_USERNAME,
    DB_PASSWORD : process.env.DB_PASSWORD,
    options : {
        host : process.env.DB_HOSTNAME,
        dialect : 'mysql'
    }
}