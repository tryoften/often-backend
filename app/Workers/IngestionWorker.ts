import Worker from './Worker';
import { firebase as FirebaseConfig } from '../config';
import GeniusService from '../Services/Genius/GeniusService';
import * as _ from 'underscore';
import Search from '../Search/Search';
import { firebase as FirebaseConfig } from '../config';
import Firebase = require('firebase');
import Request from '../Models/Request';
import {Requestable} from '../Interfaces/Requestable';
import ServiceDispatcher from '../Models/ServiceDispatcher';

class IngestionWorker extends Worker {
	searchQueueRef: Firebase;
	serviceDispatcher: ServiceDispatcher;

	constructor (opts = {}) {
		console.log('initiating');
		let options = _.defaults(opts, FirebaseConfig.queues.ingestion);
		super(options);
		this.searchQueueRef = new Firebase(`${FirebaseConfig.queues.search.url}/tasks`);
		this.serviceDispatcher = new ServiceDispatcher({
			search: new Search(),
			services: {
				genius: GeniusService
			}
		});
	}

	process (data, progress, resolve, reject) {
		var request = new Request(<Requestable>data);

		return this.serviceDispatcher.process(request)
			.then((response) => {
				/* Queue up the request to be picked up by Search */
				var requestObj = {};
				requestObj[request.id] = request;
				this.searchQueueRef.update(requestObj);
				resolve(response);

			})
			.catch(err => {
				/* Make sure that request is updated appropriately */
				var requestObj = {};
				requestObj[request.id] = request;
				this.searchQueueRef.set(requestObj);
				reject(err);
			});

	}
}

export default IngestionWorker;
