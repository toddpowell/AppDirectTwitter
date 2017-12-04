var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var home = require('./routes/home');
var tweets = require('./routes/tweets');
var settings = require('./routes/settings');
var about = require('./routes/about');
var usermessage = require('./routes/usermessage');
var embed = require('./routes/embed');

var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

// Set defaults
if (!localStorage.getItem('maxTweets')) { localStorage.setItem("maxTweets", 30); }
if (!localStorage.getItem('userAccountNameA')) 
   { localStorage.setItem("userAccountNameA", "appdirect"); }
if (!localStorage.getItem('userAccountNameB')) 
   { localStorage.setItem("userAccountNameB", "laughingsquid"); }
if (!localStorage.getItem('userAccountNameC')) 
   { localStorage.setItem("userAccountNameC", "techcrunch"); }

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', home);
app.use('/tweets', tweets);
app.use('/settings', settings);
app.use('/about', about);
app.use('/usermessage', usermessage);
app.use('/embed', embed);

app.post('/settings', function(req,res){
  console.log('maxTWeets : ' + req.body.max);
  console.log('user1 : ' + req.body.user1);
  console.log('user2 : ' + req.body.user2);
  console.log('user3 : ' + req.body.user3);
  // console.log('brief : ' + req.body.brief);
  // console.log('extended : ' + req.body.extended);
  if (req.body.max) { localStorage.setItem('maxTweets', req.body.max);  }
  if (req.body.user1) { localStorage.setItem('userAccountNameA', req.body.user1); }
  if (req.body.user2) { localStorage.setItem('userAccountNameB', req.body.user2); }
  if (req.body.user3) { localStorage.setItem('userAccountNameC', req.body.user3); }

  //res.send(200);
  res.redirect(303, '/usermessage');
  //res.render('usermessage', { message: "Settings updated" });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
