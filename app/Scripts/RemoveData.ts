import * as Firebase from 'firebase';
import {firebase as FirebaseConfig} from '../config';
import * as rest from 'restler';

var current = 0;
var total = 0;
var chunkSize = 5000;

FirebaseConfig.BaseURL = 'https://often-dev.firebaseio.com';

if (FirebaseConfig.BaseURL !== 'https://often-dev.firebaseio.com') {
	throw new Error("You're about to run a deletion scrip in an environment that isn't dev. Uncomment this line if you want to proceed.");
}

function getIds (mediaType) {
	return new Promise( (resolve, reject) => {
		rest.get(`${FirebaseConfig.BaseURL}/${mediaType}.json\?shallow\=true`).on('complete', (result) => {
			console.log('got results');
			resolve(Object.keys(result));
		});
	});

}

function deleteChunk(type, chunk: string[]) {

	return new Promise((resolve, reject) => {
		var updObj = {};
		for (var id of chunk) {
			updObj[`${type}/${id}`] = null;
		}

		 new Firebase(FirebaseConfig.BaseURL).update(updObj, (err) => {
			 if (err) {
			 	reject(err);
			 } else {
				 console.log(`Deleted... ${current++} of ${total}`);
				 resolve(true);
			 }
		 });

	}
}

function deleteEntries (mediaType, idList) {

	var promises = [];

	for (let i = 0; i < idList.length; i = i + chunkSize) {
		var chunk = idList.slice(i, i + chunkSize);
		promises.push(deleteChunk(mediaType, chunk));
	}

	return Promise.all(promises);

}

var mediaType = 'lyrics';
getIds(mediaType).then((ids: string[]) => {
	console.log(ids.length);
	total = ids.length / chunkSize;
	var sub = ids.chunk(0, 100000);
	deleteEntries(mediaType, sub);
});
