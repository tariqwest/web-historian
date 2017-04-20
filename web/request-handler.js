var path = require('path');
var archiveHelpers = require('../helpers/archive-helpers');
var httpHelpers = require('./http-helpers');
var fs = require('fs');
var qs = require('querystring');

exports.publicFile = function(url, res, statusCode) {
  var fileExt = url.slice(url.indexOf('.') + 1);
  url = url.slice(1);
  fs.readFile(path.join(__dirname, `/public/${url}`), function(err, data) {
    statusCode = statusCode || 200;
    if (err) {
      statusCode = 404;
      res.writeHead(statusCode, httpHelpers.headers);
      res.write('404 Not in Archive, submit POST request to add\n' + JSON.stringify(err));
      res.end();
    } else {
      httpHelpers.headers['Content-Type'] = `text/${fileExt}`;
      res.writeHead(statusCode, httpHelpers.headers);
      res.write(data);
      res.end();
    }
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
    } else {
      httpHelpers.headers['Content-Type'] = `text/html`;
      res.writeHead(statusCode, httpHelpers.headers);
      res.write(data);
      res.end();
    }
  });
};

exports.decideFile = function(exists, url, res) {
  if (exists) {
    exports.archivesFile(url, res);
  } else {
    exports.publicFile(url, res);
  }
};

exports.existsInArchive = function(exists, url, res) {
  if (exists) {
    exports.archivesFile(url, res);
  } else {
    exports.publicFile('/loading.html', res, 302);
  }
};

exports.existsInList = function(exists, url, res) {
  console.log('exists in list: ', exists);
  if (exists) {
    archiveHelpers.isUrlArchived(url, function(exists) {
      exports.existsInArchive(exists, url, res);
    });
  } else {
    archiveHelpers.addUrlToList(url, function() {
      exports.publicFile('/loading.html', res, 302);
    });
  }
};

exports.handleRequest = function (req, res) {
  var statusCode;
  var url = req.url;
  var method = req.method;

  if (method === 'GET') {
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
    } else {
      statusCode = 404;
      res.writeHead(statusCode, httpHelpers.headers);
      res.write('Bad URL');
      res.end();
    }
  }

  if (method === 'POST') {
    var body = '';

    req.on('data', function(data) {
      body += data;
    });

    req.on('end', function() {
      body += '\n';
      var post = qs.parse(body);
      archiveHelpers.isUrlInList(post.url, function(exists) {
        console.log(post.url);
        exports.existsInList(exists, post.url, res);
      });
    });
  }
};
