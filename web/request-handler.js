var path = require('path');
var archiveHelpers = require('../helpers/archive-helpers');
var httpHelpers = require('./http-helpers');
var fs = require('fs');
// require more modules/folders here!

exports.publicFile = function(url, res) {
  var statusCode;
  var fileExt = url.slice(url.indexOf('.') + 1);
  url = url.slice(1);
  fs.readFile(path.join(__dirname, `/public/${url}`), function(err, data) {
    statusCode = 200;
    if (err) {
      statusCode = 404;
      res.writeHead(statusCode, httpHelpers.headers);
      res.write(JSON.stringify(err));
      res.end();
    }
    httpHelpers.headers['Content-Type'] = `text/${fileExt}`;
    res.writeHead(statusCode, httpHelpers.headers);
    res.write(data);
    res.end();
  });
};

exports.archivesFile = function(url, res) {
  var statusCode;
  url = url.slice(1);
  fs.readFile(`${archiveHelpers.paths.archivedSites}/${url}`, function(err, data) {
    statusCode = 200;
    if (err) {
      statusCode = 404;
      res.writeHead(statusCode, httpHelpers.headers);
      res.write(JSON.stringify(err));
      res.end();
    }
    httpHelpers.headers['Content-Type'] = `text/html`;
    res.writeHead(statusCode, httpHelpers.headers);
    res.write(data);
    res.end();
  });
};

exports.decideFile = function(exists, url, res) {
  if (exists) {
    exports.archivesFile(url, res);
  } else {
    exports.publicFile(url, res);
  }
};

exports.handleRequest = function (req, res) {
  var statusCode;
  // Get path from req
  var url = req.url;
  // Get method from request
  var method = req.method;
  // if method is GET
  if (method === 'GET') {
    // if path is '/'' return index.html
    if (url === '/') {
      fs.readFile(path.join(__dirname, '/public/index.html'), function(err, data) {
        if (err) {
          throw err;
        }
        statusCode = 200;
        httpHelpers.headers['Content-Type'] = `text/html`;
        res.writeHead(statusCode, httpHelpers.headers);
        res.write(data);
        res.end();
      });
    } else if(url.indexOf('.') !== -1) {

      fs.exists(`${archiveHelpers.paths.archivedSites}/${url}`, function(exists) {
        exports.decideFile(exists, url, res);
      });

      
    }else{
      archiveHelpers.readListOfUrls();
    }
    // res.end(archive.paths.list);
  }
};
