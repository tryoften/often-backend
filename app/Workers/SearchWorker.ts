import Worker from './Worker';
import SearchRequestDispatcher from '../Search/SearchRequestDispatcher';
import { firebase as FirebaseConfig } from '../config';
import * as _ from 'underscore';
import Search from '../Search/Search';
import GeniusService from '../Services/Genius/GeniusService';
import Request from '../Models/Request';
import {Requestable} from '../Interfaces/Requestable';
import RequestType from '../Models/RequestType';
import Firebase = require('firebase');

class SearchWorker extends Worker {
	dispatcher: SearchRequestDispatcher;
	ingestionQueueRef: Firebase;

	constructor (opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.BaseURL + FirebaseConfig.queues.search);
		super(options);
		this.ingestionQueueRef = new Firebase(`${FirebaseConfig.BaseURL + FirebaseConfig.queues.ingestion.url}/tasks`);
		this.dispatcher = new SearchRequestDispatcher({
			search: new Search(),
			services: {
				genius: GeniusService
			}
		});
	}

	process (data, progress, resolve, reject) {
		var request = new Request(<Requestable>data);
		// returns a promise when all providers are resolved
		return this.dispatcher
			.process(request)
			.then(d => {

				resolve(d);
				/* If ingestData is set to true then unset it and send it ingestion worker */
				if (request.type === RequestType.search && request.ingestData) {
					request.ingestData = false;
					var requestObj = {};
					requestObj[request.id] = request;
					this.ingestionQueueRef.set(requestObj);
				}

			})
			.catch(err => {
				reject(err);
			});
	}
}

export default SearchWorker;
