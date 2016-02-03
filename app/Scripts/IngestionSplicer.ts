import * as Firebase from 'firebase';
import { firebase as FirebaseConfig} from '../config';
var chunkSize = 1000;
var dumpRef = new Firebase(`${FirebaseConfig.BaseURL}/queues/elastic_dump_file/tasks`);

function splitArr(arr, chunkSize) {
	var chunked = [];
	for (var i = 0; i < arr.length; i += chunkSize) {
		chunked.push(arr.slice(i, i + chunkSize));
	}
	return chunked;
}

var artistsRef = new Firebase(`${FirebaseConfig.BaseURL}/artists`);
artistsRef.on('value', snap => {
	console.log("Artists sync");
	 var obi = snap.val();
	 var keys = Object.keys(obi);
	 var ids = [];
	 for (var k of keys) {
		 var oftenId = obi[k];
		 ids.push(oftenId);
	 }
	 var groups = splitArr(ids, chunkSize);
	 for (var gr of groups) {
		dumpRef.push({
			ids: gr,
			type: 'artist'
		});
	}
});

var tracksRef = new Firebase(`${FirebaseConfig.BaseURL}/tracks`);
tracksRef.on('value', snap => {
	console.log("Tracks sync");
	var obi = snap.val();
	var keys = Object.keys(obi);
	var ids = [];
	for (var k of keys) {
		var oftenId = obi[k];
		ids.push(oftenId);
	}
	var groups = splitArr(ids, chunkSize);
	for (var gr of groups) {
		dumpRef.push({
			ids: gr,
			type: 'track'
		});
	}
});


var lyricsRef = new Firebase(`${FirebaseConfig.BaseURL}/idspace/genius/lyric`);
lyricsRef.on('value', snap => {
	console.log("Lyrics sync");
	var obi = snap.val();
	var keys = Object.keys(obi);
	var ids = [];
	for (var k of keys) {
		var oftenId = obi[k];
		ids.push(oftenId);
	}

	var groups = splitArr(ids, chunkSize);
	for (var gr of groups) {
		dumpRef.push({
			ids: gr,
			type: 'lyric'
		});
	}
});

