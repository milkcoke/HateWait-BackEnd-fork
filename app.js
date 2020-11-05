const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const loginRouter = require('./routes/login');
const indexRouter = require('./routes/index');
const memberRouter = require('./routes/member');
const reactRouter = require('./routes/reactTest');
const storeRouter = require('./routes/store');
const registerRouter = require('./routes/register');
const waitingCustomerRouter = require('./routes/waiting_customer');
const couponRouter = require('./routes/coupon');

const sequelize = require('./models').sequelize;
const session = require('express-session');
// connect-flash middleware use 'cookie-parser' and 'express-session'
const flash = require('connect-flash');
const passport = require('./config/passport');
const app = express();

console.log('==========server started!========');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());

// keep order of like that
// =================================
// session -> express. urlencoded -> passport.initialize() -> passport.session()
// =================================
// session 옵션 설정
// secret : 쿠임의 변조를 방지하기 위한 값, 세션 암호화 키
// resave : always save session?
// httpOnly: javascript 로 cookie 접근 방지 옵션
// true일 경우 (클라이언트가 쿠키값을 직접 볼 수 없음)
// secure: https 프로토콜만 허용하는지 여부
// saveUninitialized: before save session, uninitialized state save/
app.use(session({
        secret : '$%HATEWAIT$%',
        resave : false,
        saveUninitialized: true,
        cookie: {
            httpOnly: false,
            secure: false
        }
    })
);
app.use(flash());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));





// authenticate : Model - DB Connection authentication
// sync : inform about information of tables in DB to sequelize
// Synchronizing all models at once!
sequelize.authenticate()
    .then(() => {
        console.log('sequelize success to connect with DB');
        return sequelize.sync()
    })
    .then(success => {
        console.log('sequelize success to synchronize defined models to the DB' + success);
    })
    .catch(error => {
        console.error(error);
    });



app.use(passport.initialize());
// passport - session connect method!
// Application uses persistent login sessions
app.use(passport.session());


app.use('/', indexRouter);
app.use('/login',loginRouter);
app.use('/members', memberRouter);
app.use('/stores', storeRouter);
app.use('/register', registerRouter);
app.use('/react-test', reactRouter);
app.use('/waiting-customers', waitingCustomerRouter);
app.use('/coupon', couponRouter);



app.use(function(request, response, next) {
  // isAuthenticated : 현재 로그인 되어있는지 true, false
  response.locals.isAuthenticated = request.isAuthenticated();
  //passport에서 추가하는 항목으로 로그인 되면 session으로 부터 user를 deserialize하여 생성됨.
  //locals에 담긴 변수는 ejs 에서 바로 사용 가능.
  //로그인된 user 정보를 불러오는데 사용됨.
  response.locals.currentUser = request.user;
  next();
})
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
