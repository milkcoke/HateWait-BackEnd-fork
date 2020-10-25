const express = require('express');
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'HateWait',
    teamNumber: 3,
    teamMember: ['조예린','손영호','문승훈'],
    sessionInfo: req.session.passport.storeInfo,
    cookieInfo : req.session._passport.storeInfo
  });
  console.log('session : ' + req.session);
});

module.exports = router;
