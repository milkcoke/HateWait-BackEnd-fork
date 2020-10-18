
module.exports = {
    database : process.env.DB_DBNAME,
    username : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
    options : {
        host : process.env.DB_HOSTNAME,
        dialect : 'mysql'
    }
}