var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var vue = require('vue');



var routes = require('./routes/index');


var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1) // trust first proxy

app.use('/', routes);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      messageResult: err.messageResult,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    messageResult: err.messageResult,
    error: {}
  });
});

module.exports = app;
