var debug = require('debug')('asciinema-local-server:app');
var express = require('express');
var fs = require('fs');
var ip = require('ip');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var filescan = require('./filescan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /www
//app.use(favicon(path.join(__dirname, 'www', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'www')));
app.use('/asciinema', express.static(filescan.asciinemaDir));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

app.on_socketconnection = function (socket) {
  debug('A new session has started, sending ' + filescan.getAsciinemaFiles());
  socket.emit('new asciifiles', filescan.getAsciinemaFiles());
};

// write IP file for client to pick it up
var ipFilePath;
if (process.env.SNAP_DATA) {
  ipFilePath = process.env.SNAP_DATA;
} else {
  ipFilePath = '/tmp';
}

fs.writeFile(path.join(ipFilePath, 'server_ip'), ip.address(), function (err) {
  if (err) {
    return debug(err);
  }
});

module.exports = app;
