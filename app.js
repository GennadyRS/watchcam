var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var csrf = require('csurf');
var passport = require('passport');
var logger = require('morgan');
var bodyParser = require('body-parser');

// pass the session to the connect sqlite3 module
// allowing it to inherit from session.Store
var SQLiteStore = require('connect-sqlite3')(session);

const multer  = require('multer');
const upload = multer();
var app = express();

app.use('/savefile',upload.single('photo'));

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');

app.use(express.urlencoded({ extended: false }));

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.pluralize = require('pluralize');

//app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'televisor teapot',
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));

app.use(csrf());
app.use(passport.authenticate('session'));
app.use(function(req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;
  req.session.messages = [];
  next();
});

app.use(function(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});


app.use(function(req, res, next){
  req.secure = true;
  next();
});

app.use('/', indexRouter);
app.use('/', authRouter);

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
