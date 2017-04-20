var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var rl = require('readline');
var http = require('http');
var request = require('request');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  var urlArray = [];

  var linereader = rl.createInterface({
    input: fs.createReadStream(exports.paths.list)
  });

  linereader.on('line', function(line){
    urlArray.push(line);
  });

  linereader.on('close', function(line){
    callback(urlArray);
  });
};

exports.isUrlInList = function(url, callback) {
  exports.readListOfUrls(function(array) {
    callback(_.includes(array, url));
  });
};

exports.addUrlToList = function(url, callback) {
  fs.appendFile(exports.paths.list, url, callback);
};

exports.isUrlArchived = function(url, callback) {
  fs.exists(`${exports.paths.archivedSites}/${url}`, function(exists) {
    callback(exists);
  });
};

exports.addUrlToArchive = function(url, urlData){
  fs.writeFile(`${exports.paths.archivedSites}/${url}`, urlData, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Data written successfully');
    }
  });
};

exports.downloadUrls = function(urls) {
  for (var i = 0; i < urls.length; i++) {
    request(urls[i], function(err, res, body) {
      exports.addUrlToArchive(urls[i], body);
    });
  }
};
