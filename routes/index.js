const express = require('express');
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'HateWait',
    teamNumber: 3,
    teamMember: ['조예린','손영호','문승훈'],
  });
  console.log('session : ' + req.session);
  console.log('session info: ' + req.session._passport);
  console.log('session info: ' + req.session._passport.id);
  console.log('session info: ' + req.session._passport.name);
  if (req.session.passport) {
    console.log('session info: ' + req.session.passport);
  }


});

module.exports = router;

