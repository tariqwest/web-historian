// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.

var archiveHelpers = require('../helpers/archive-helpers');

exports.unarchivedUrlQueue = [];
exports.processingUrlsCount;

exports.htmlFetcher = function() {
  console.log('Fetching...');
  console.log('Queue: ', exports.unarchivedUrlQueue);
  archiveHelpers.readListOfUrls(function(urlList) {
    exports.processingUrlsCount = urlList.length;
    console.log('Reading URL list: ', urlList.length);
    for (var i = 0; i < urlList.length; i++) {
      var currentUrl = urlList[i];
      console.log('For loop: ', currentUrl);
      archiveHelpers.isUrlArchived(currentUrl, function(exists) {
        console.log('Checking if URL is archived: ', exists);
        console.log('currentUrl: ', currentUrl);
        exports.generateUnarchivedUrlQueue(exists, currentUrl);
        console.log('Count BEFORE: ', exports.processingUrlsCount);
        exports.processingUrlsCount--;
        console.log('Count: ', exports.processingUrlsCount);
      });
    }
  });
  exports.checkForDownloadQueue();
};

exports.generateUnarchivedUrlQueue = function(exists, url) {
  console.log('Generating unarchived URL list');
  if (!exists) {
    exports.unarchivedUrlQueue.push(url);
  }
};

exports.checkForDownloadQueue = function() {
  if (exports.unarchivedUrlQueue.length > 0) {
    console.log('Unarchived list obtained, now calling download');
    archiveHelpers.downloadUrls(exports.unarchivedUrlQueue);
    exports.unarchivedUrlQueue = [];
  } else if (exports.processingUrlsCount === 0) {
    return;
  } else {
    setTimeout(exports.checkForDownloadQueue, 5000);
  }
};
