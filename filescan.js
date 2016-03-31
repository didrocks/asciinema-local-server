var debug = require('debug')('asciinema-local-server:filescan');
var fs = require('fs');
var path = require('path');

var asciifiles = [];

// check regularly the ubuntu user directory which can contain asciinema files
var asciinemaDir;
try {
  asciinemaDir = process.env.SNAP_USER_DATA.replace('/root', '/home/ubuntu');
}
catch (ex) {
  asciinemaDir = process.cwd();
}

var getAsciinemaFiles = function (err, files) {
  var newAsciifiles = [];
  if (err) {
    throw err;
  }

  files.forEach(function (file) {
    if (path.extname(file) === '.asciinema')
      newAsciifiles.push(file);
  });

  // Only process if file list is now different
  if ((newAsciifiles.length == asciifiles.length) &&
       newAsciifiles.every(function (element, index) {
         return element === asciifiles[index];
       })
     ) {
    return;
  }

  debug('New files on disk');
  asciifiles = newAsciifiles;
  var app = require('./app');
  app.io.emit('new asciifiles', asciifiles);
};

setInterval(function () {
  debug('Checking for asciinema files');
  fs.readdir(asciinemaDir, getAsciinemaFiles);
}, 10000);

exports.getAsciinemaFiles = function () {
  return asciifiles;
};

exports.asciinemaDir = asciinemaDir;
