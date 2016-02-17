var Firebase = require('firebase');
var fs = require('fs');
var dateformat = require('dateformat');
var mkdirp = require('mkdirp');
var path = require('path');
var os = require('os');

function getUserHome() {
	return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function backupFirebaseLocation(rootURL: string, relativeObjectPath: string, max_count = 5000) {
	var dateString = dateformat(new Date(), 'yyyy-mm-dd-HH:MM');
	var baseDir = path.join(getUserHome(), '/firebase-backups/', relativeObjectPath, dateString, '/');
	var rootRef = new Firebase(rootURL + relativeObjectPath);

	// no need to edit below this line
	console.log('Starting backup...');

	var totalCount = 0;
	var pageCount = 0;
	var endOfStream = false;

	function fetchChunk(lastId?: string) {
		var currentRef = rootRef.orderByKey();

		if (lastId) {
			currentRef = currentRef.startAt(lastId);
		}

		currentRef.limitToFirst(max_count).once('value', function (snapshot) {
			var data = snapshot.val();
			var dataCount = snapshot.numChildren();
			var dataKeys = Object.keys(data);
			var lastKey = dataKeys[dataKeys.length - 1];

			if (dataCount < max_count) {
				endOfStream = true;
				max_count = snapshot.numChildren();
				console.log('last page');
			}

			var filepath = baseDir + pageCount++ + '.json';
			console.log('writing file: ', filepath);

			fs.writeFile(filepath, JSON.stringify(data), (err) => {
				if (err) {
					throw err;
				}

				if (endOfStream) {
					console.log('done downloading data, num items: ', ++totalCount);
					process.exit();
				} else {
					fetchChunk(lastKey);
				}
			});

			totalCount += snapshot.numChildren();
			console.log('Processed item: ', totalCount);
		});
	}

	mkdirp(baseDir, function(err) {
		if (err) {
			throw err;
		}
		fetchChunk();
	})
}

backupFirebaseLocation('https://often-prod.firebaseio.com/', 'lyrics/', 5000);
