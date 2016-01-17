import Worker from './Worker';
import { firebase as FirebaseConfig } from '../config';
import GeniusService from '../Services/Genius/GeniusService';
import * as _ from 'underscore';

class IngestionWorker extends Worker {
	genius: GeniusService;

	constructor (opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.queues.track_ingestion);
		super(options);
		this.genius = new GeniusService({
			provider_id: 'genius'
		});
		console.log('done');
	}

	process (data, progress, resolve, reject) {
		console.log("Processing: " + Object.keys(data));
		// returns a promise when all providers are resolved
		return this.genius.ingest([data.trackId])
			.then(d => {
				resolve(d);
			})
			.catch(err => {
				reject(err);
			});

	}
}

export default IngestionWorker;
