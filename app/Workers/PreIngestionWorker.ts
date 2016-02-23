import Worker from './Worker';
import * as _ from 'underscore';
import { firebase as FirebaseConfig } from '../config';
import Firebase = require('firebase');
import PreIngestor from '../Ingestors/Lyric/PreIngestor';

class PreIngestionWorker extends Worker {
	taskIdsRef: Firebase;
	preIngestor: PreIngestor;

	constructor (opts = {}) {
		console.log('initiating');
		let options = _.defaults(opts, FirebaseConfig.queues.preingestion);
		super(options);
		this.preIngestor = new PreIngestor();
		this.taskIdsRef = new Firebase(`${FirebaseConfig.BaseURL}/trackIds`);
	}

	process (data, progress, resolve, reject) {
		console.log(data.url);
		return this.preIngestor.getTracksForArtist(data.url, false)
			.then((response) => {
				/* Queue up the request to be picked up by Search */
				var updObj = {};
				for (var r of response) {
					updObj[r] = r;
				}
				this.taskIdsRef.update(updObj);
				resolve(updObj);

			})
			.catch(err => {
				/* Make sure that request is updated appropriately */
				reject(err);
			});

	}
}

export default PreIngestionWorker;
