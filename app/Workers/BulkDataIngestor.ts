import Worker from './Worker';
import { firebase as FirebaseConfig } from '../config';
import GeniusService from '../Services/Genius/GeniusService';
import * as _ from 'underscore';
import Search from '../Search/Search';
import { IndexedObject } from '../Interfaces/Indexable';
import * as Firebase from 'firebase';

class BulkDataIngestor extends Worker {
	genius: GeniusService;
	search: Search;
	buffer: IndexedObject[];
	errQueue: any;
	flushSize: number;

	constructor (opts = {}) {
		console.log('Bulk Data ingestion settings: ', FirebaseConfig.queues.bulk_ingest);
		this.errQueue = new Firebase(`${FirebaseConfig.BaseURL}/bulk_ingest_errors`);
		let options = _.defaults(opts, FirebaseConfig.queues.bulk_ingest);
		super(options);
		this.genius = new GeniusService({
			provider_id: 'genius'
		});
		this.search = new Search();
	}

	process (data, progress, resolve, reject) {



		console.log("Processing: " + Object.keys(data));
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
				console.log('Got an error', err);
				this.errQueue.push({
					data: data,
					err: JSON.stringify(err)
				});
				resolve(err);
			});

	}
}

export default BulkDataIngestor;
