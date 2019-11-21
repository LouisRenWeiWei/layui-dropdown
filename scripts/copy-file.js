#!/usr/bin/env node

const fs = require('fs');

module.exports = exports;

exports.copy = copy;
function copy(src, dest) {
  fs.readdir(src, function(err, paths) {
    if (err) {
      throw err;
    }

    paths.forEach(function(path) {
      const resolveSrc = src + '/' + path;
      const resolveDest = dest + '/' + path;
      let readable;
      let writable;

      fs.stat(resolveSrc, function(err, stat) {
        if (err) {
          throw err;
        }

        if (stat.isFile()) {
          readable = fs.createReadStream(resolveSrc);
          writable = fs.createWriteStream(resolveDest);
          readable.pipe(writable);
        } else if (stat.isDirectory()) {
          exists(resolveSrc, resolveDest, copy);
        }
      });
    });
  });
}

exports.exists = exists;
function exists(src, dest, callback) {
  fs.exists(dest, function(exists) {
    if (exists) {
      callback(src, dest);
    } else {
      fs.mkdir(dest, function() {
        callback(src, dest);
      });
    }
  });
}
