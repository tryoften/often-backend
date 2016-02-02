import * as Firebase from 'firebase';
import { firebase as FirebaseConfig} from '../config';

var ref = new Firebase(`${FirebaseConfig.BaseURL}/queues/bulk_ingest/tasks`);
console.log('bout to get');
ref.on('value', snap => {
	var allTasks = snap.val();
	var taskIds = Object.keys(allTasks);

	var other = 0;
	var ingested = 0;
	var error = 0;

	for (var id of taskIds) {
		if (allTasks[id]._state === 'ingested') {
			ingested++;
		} else if (!!(allTasks[id]._error_details)) {
			error++;
		} else {
			other++;
		}

	}
	console.log(`Ingested: ${ingested}\t Error: ${error}\t Other: ${other}\t Total: ${taskIds.length}`);
});
