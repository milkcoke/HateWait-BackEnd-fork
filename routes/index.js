const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const dbConnection = mysql.createConnection({
  host: process.env.DB_HOSTNAME,
  user: process.env.DB_USERNAME,
  password : process.env.DB_PASSWORD,
  database: process.env.DBNAME
});

dbConnection.connect(function(err){
  if(err) throw err;
  console.log("MySQL Database is Connected!");
})

dbConnection.query('SHOW TABLES', function(err, result){
  if (err) throw err;
  console.log('result: ', result);
});

dbConnection.end()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'HateWait', teamNumber: 3, teamMember: ['조예린','손영호','문승훈'] });
});

module.exports = router;
