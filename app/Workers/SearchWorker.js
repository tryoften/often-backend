import Worker from './Worker';
import SearchRequestDispatcher from '../Search/SearchRequestDispatcher';
import { firebase as FirebaseConfig } from '../config';
import _ from 'underscore';

class SearchWorker extends Worker {
	
	constructor (opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.queues.search);

		super(options);
		this.dispatcher = new SearchRequestDispatcher();
	}

	process (data, progress, resolve, reject) {
		// Read and process task data
		console.log('starting ' + data.id);

		//returns a promise when all providers are resolved
		return this.dispatcher
			.process(data)
			.then( (d) => {
				console.log('finished' + data.id);
				resolve(d);
			})
			.catch( (err) => {
				reject(err);
			});
	}
}

export default SearchWorker;