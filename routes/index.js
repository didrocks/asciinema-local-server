var debug = require('debug')('asciinema-local-server:router');
var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
/*router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});*/

/* return home page for asciinema file request */
router.get(/.*\.asciinema$/, function (req, res, next) {
  debug('asciinema file requested: ' + req);
  res.sendFile(path.join(__dirname, '..', 'www', 'index.html'));
});

module.exports = router;
