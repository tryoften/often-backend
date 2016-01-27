import { firebase as FirebaseConfig } from '../config';
import Firebase = require('firebase');
import Search from '../Search/Search';
var search = new Search();

var target = new Firebase(`${FirebaseConfig}/queues/es_ingestion/tasks`);
function chunk (idArr) {
	var groups = [];
	var chunkSize = 1000;
	for (let i = 0; i < idArr.length; i += chunkSize) {
		groups.push(idArr.slice(i, i + chunkSize));
	}
	return groups;
}

var tracks = new Firebase(`${FirebaseConfig}/tracks`);
tracks.once('value', snap => {
	console.log('synced');
	let artistIds = Object.keys(snap.val());
	target.push({
		ids: chunk(artistIds),
		type: 'track'
	});
});


