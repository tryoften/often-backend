import Worker from './Worker';
import { firebase as FirebaseConfig } from '../config';
import GeniusService from '../Services/Genius/GeniusService';
import * as _ from 'underscore';
import Search from '../Search/Search';
import { IndexedObject } from '../Interfaces/Indexable';

class IngestionWorker extends Worker {
	genius: GeniusService;
	search: Search;
	buffer: IndexedObject[];
	flushSize: number;

	constructor (opts = {}) {
		console.log('initiating');
		let options = _.defaults(opts, FirebaseConfig.queues.track_ingestion);
		super(options);
		this.genius = new GeniusService({
			provider_id: 'genius'
		});
		this.search = new Search();
	}

	process (data, progress, resolve, reject) {
		console.log('Processing: ' + Object.keys(data));
		// returns a promise when all providers are resolved
		return this.genius.ingest(data.tracks)
			/*.then(indexableData => {
				// Ingest data to ElasticSearch
				this.search.index(indexableData);
			})
			*/
			.then(results => {
				resolve(results);
			})
			.catch(err => {
				reject(err);
			});

	}
}

export default IngestionWorker;
