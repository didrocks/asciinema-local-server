var debug = require('debug')('asciinema-local-server:filescan');
var fs = require('fs');
var path = require('path');

const ASCIINEMA_SUFFIX = '.asciinema';

var asciifiles = [];
var asciifileNames = [];

// check regularly the ubuntu user directory which can contain asciinema files
var asciinemaDir;
try {
  asciinemaDir = path.join(process.env.SNAP_DATA, 'records');
}
catch (ex) {
  asciinemaDir = process.cwd();
}

// create the directory as writable for any user
if (!fs.existsSync(asciinemaDir)) {
  fs.mkdirSync(asciinemaDir, 0777, function (err) {
    if (err) {
      throw err;
    }
  });

  // reoverride due to mask
  fs.chmodSync(asciinemaDir, 0777);
}

var getAsciinemaFiles = function (err, files) {
  var newAsciifileNames = [];
  if (err) {
    throw err;
  }

  files.forEach(function (file) {
    if (path.extname(file) === ASCIINEMA_SUFFIX)
      newAsciifileNames.push(file);
  });

  // Only process if file list is now different
  if ((newAsciifileNames.length == asciifileNames.length) &&
       newAsciifileNames.every(function (element, index) {
         return element === asciifileNames[index];
       })
     ) {
    return;
  }

  debug('New files on disk: ' + newAsciifileNames);
  asciifileNames = newAsciifileNames.slice(); // assign now to keep same file system order
  newAsciifiles = [];

  // sort files in chronological order
  newAsciifileNames.sort(function (a, b) {
    return fs.statSync(path.join(asciinemaDir, b)).mtime.getTime() -
      fs.statSync(path.join(asciinemaDir, a)).mtime.getTime();
  });

  // Extract title and date metadata from file name (Do not open them as they can be large)
  var regexp = new RegExp('(.*)_([0-9:]*)\.([0-9\-]*)\.asciinema');
  newAsciifileNames.forEach(function (file) {
    var match = regexp.exec(file);
    newAsciifiles.push({
      filename: file,
      title: match[1].split('_').join(' '),
      date: match[3] + ' (' + match[2] + ')',
    });
  });

  asciifiles = newAsciifiles;
  var app = require('./app');
  app.io.emit('new asciifiles', asciifiles);
};

setInterval(function () {
  debug('Checking for asciinema files');
  fs.readdir(asciinemaDir, getAsciinemaFiles);
}, 10000);
fs.readdir(asciinemaDir, getAsciinemaFiles);


exports.getAsciinemaFiles = function () {
  return asciifiles;
};

exports.asciinemaDir = asciinemaDir;
