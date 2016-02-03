import Firebase = require('firebase');
import { firebase as FirebaseConfig } from '../config';

var imageIngestionTasks = new Firebase(`${FirebaseConfig.BaseURL}/queues/track_ingestion/tasks`);

imageIngestionTasks.on('value', sync => {
	let data = sync.val();
	let vals = Object.keys(data);
	let count = 0;
	for (var id of vals) {
		var item = data[id];
		if (item._state === 'track_ingested') {
			count++;
		}
	}
	console.log(`Ingested ${count} of ${vals.length}`);
});

var imageResizingTasks = new Firebase(`${FirebaseConfig.BaseURL}/queues/image_resizing/tasks`);

imageResizingTasks.on('value', sync => {
	let data = sync.val();
	let vals = Object.keys(data);
	let count = 0;
	for (var id of vals) {
		var item = data[id];
		if (item._state === 'images_resized') {
			count++;
		}
	}
	console.log(`Resized ${count} of ${vals.length}`);
});
