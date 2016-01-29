import { firebase as FirebaseConfig } from '../config';
import Firebase = require('firebase');
var chunkSize = 1000;
var target = new Firebase(`${FirebaseConfig.BaseURL}/queues/es_ingestion/tasks`);
function chunk (idArr) {
	var groups = [];

	for (let i = 0; i < idArr.length; i += chunkSize) {
		groups.push(idArr.slice(i, i + chunkSize));
	}
	return groups;
}

var items = new Firebase(`${FirebaseConfig.BaseURL}/tracks`);
items.once('value', snap => {
	console.log('synced');
	let itemIds = Object.keys(snap.val());
	var chunks = chunk(itemIds);
	var start = 0;
	for (var c of chunks) {
		target.push({
			ids: c,
			type: 'track'
		});
		console.log('Pushed ', chunkSize * start++, ' of ', itemIds.length);
	}
});


