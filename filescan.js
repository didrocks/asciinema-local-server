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
      newAsciifiles.add(file);
  });

  // switch with new file list
  asciifiles = newAsciifiles;
};

setInterval(function () {
  debug('Checking for asciinema files');
  fs.readdir(asciinemaDir, getAsciinemaFiles);
}, 10000);

module.exports = asciifiles;
