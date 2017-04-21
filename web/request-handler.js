var path = require('path');
var archiveHelpers = require('../helpers/archive-helpers');
var httpHelpers = require('./http-helpers');
var fs = require('fs');
var qs = require('querystring');
//var jsdom = require('jsdom');
var cheerio = require('cheerio');

exports.publicFile = function(url, res, statusCode) {
  var fileExt = url.slice(url.indexOf('.') + 1);
  url = url.slice(1);
  fs.readFile(path.join(__dirname, `/public/${url}`), function(err, data) {
    statusCode = statusCode || 200;
    if (err) {
      statusCode = 404;
      res.writeHead(statusCode, httpHelpers.headers);
      res.write('404 Not in Public Directory, submit POST request to add\n' + JSON.stringify(err));
      res.end();
    } else {
      // if(url === 'loading.html'){
      //   console.log('modifying? ', url);
      //   var $ = cheerio.load(data);
      //   $('#polling-url').data('polling-data', 'http://127.0.0.1:8080/' + url);
      //   var newData = $.html('html');
      // }
      httpHelpers.headers['Content-Type'] = `text/${fileExt}`;
      res.writeHead(statusCode, httpHelpers.headers);
      res.write(data);
      res.end();
    }
  });
};

exports.archivesFile = function(url, res) {
  var statusCode;
  url = url.trim();
  fs.readFile(`${archiveHelpers.paths.archivedSites}/${url}`, function(err, data) {
    statusCode = 302;
    if (err) {
      statusCode = 404;
      res.writeHead(statusCode, httpHelpers.headers);
      res.write('404 Not in Archive, submit POST request to add\n' + JSON.stringify(err));
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
  console.log('exists in archive: ', exists);
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
      archiveHelpers.isUrlInList(JSON.parse(JSON.stringify(post.url.trim())), function(exists) {
        console.log(post.url);
        exports.existsInList(exists, post.url, res);
      });
    });
  }
};
