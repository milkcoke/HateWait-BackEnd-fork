const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();

const loginRouter = require('./routes/login');
const indexRouter = require('./routes/index');
const memberRouter = require('./routes/member');
const reactRouter = require('./routes/reactTest');
const storeRouter = require('./routes/store');
const registerRouter = require('./routes/register');

const sequelize = require('./models').sequelize;
// const session = require('express-session');
// const flash = require('express-flash');
const passport = require('passport');


console.log('==========server started!========');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());




// authenticate : Model - DB Connection authentication
// sync : inform about information of tables in DB to sequelize
// Synchronizing all models at once!
sequelize.authenticate()
    .then(() => {
        console.log('sequelize success to connect with DB');
        return sequelize.sync()
    })
    .then(success => {
        console.log('sequelize success to synchronize defined models to the DB');
    })
    .catch(console.error);

const passportConfig = require('./config/passport_local_jwt');
passportConfig.passport_local_initialize(passport);
passportConfig.passport_jwt_initialize(passport);


app.use('/', indexRouter);
app.use('/login',loginRouter);
app.use('/members', memberRouter);
app.use('/stores', storeRouter);
app.use('/register', registerRouter);
app.use('/react-test', reactRouter);


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