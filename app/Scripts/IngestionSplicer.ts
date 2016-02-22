import * as Firebase from 'firebase';
import { firebase as FirebaseConfig} from '../config';
var chunkSize = 200;

var queueRef = new Firebase(`https://often-prod.firebaseio.com/queues/elastic_dump_file/tasks`);

function splitArr(arr, chunkSize) {
	var chunked = [];
	for (var i = 0; i < arr.length; i += chunkSize) {
		chunked.push(arr.slice(i, i + chunkSize));
	}
	return chunked;
}

function formatTask(ids: string[], type: string, targets: string[]) {
	return {
		type: type,
		ids: ids,
		targets: targets
	};
}

function fetchInChunks(rootRef, size, type, targets, start?) {
	var currRef = rootRef.orderByKey();
	if (start) {
		currRef = currRef.startAt(start);
	}
	console.log('about to fetch', start);
	currRef.limitToFirst(size).once('value', (snap) => {
		console.log('loaded...');
		var allKeys = Object.keys(snap.val());
		var resultObject = snap.val();
		var ids = [];
		for (var k of allKeys) {
			var oftenId = resultObject[k];
			ids.push(oftenId);
		}
		console.log(ids);

		var task = formatTask(ids, type, targets);
		queueRef.push(task);


		var lastOne = allKeys[allKeys.length - 1];

		if (allKeys.length < size) {
			console.log('done fetching');
			return;
		} else {
			fetchInChunks(rootRef, size, type, targets, lastOne);
		}

	});


}

var artistsRef = new Firebase(`https://often-prod.firebaseio.com/idspace/genius/artist`);
fetchInChunks(artistsRef, chunkSize, 'artist', [{type: 'elasticsearch'}]);

//
//var tracksRef = new Firebase(`https://often-prod.firebaseio.com/idspace/genius/track`);
//fetchInChunks(tracksRef, chunkSize, 'track', [{type: 'elasticsearch'}]);
//
//
//fetchInChunks(lyricsRef, chunkSize, 'lyric', [{type: 'elasticsearch'}]);

//
//queueRef.orderByChild("_state").equalTo("done").on('child_added', function(snap) {
//	queueRef.child(snap.key()).remove();
//});
