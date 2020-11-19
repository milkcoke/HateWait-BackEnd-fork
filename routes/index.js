const express = require('express');
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  // console.log('session : ' + req.session);
  // console.log('session info: ' + req.session._passport);
  //session.passport, req.session._passport.user 는 없음.

  // console.log('session info: ' + req.session._passport.id);
  // console.log('session info: ' + req.session._passport.name);

  res.render('index', {
    title: 'HateWait',
    teamNumber: 3,
    teamMember: ['조예린','손영호','문승훈'],
  });



});

module.exports = router;

