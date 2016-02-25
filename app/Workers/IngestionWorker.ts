import Worker from './Worker';
import { firebase as FirebaseConfig } from '../config';
import GeniusService from '../Services/Genius/GeniusService';
import * as _ from 'underscore';
import Search from '../Search/Search';
import Firebase = require('firebase');
import Request from '../Models/Request';
import { Requestable } from '../Interfaces/Requestable';
import ServiceDispatcher from '../Models/ServiceDispatcher';
import GeniusServiceIngestionWorker from '../Workers/GeniusServiceIngestionWorker';

class IngestionWorkerType extends String {
	static genius: IngestionWorkerType = 'genius';
}


interface IngestionWorkerOptions {
	searchQueueRef: Firebase,
	ingestionWorkers: any;
}

interface IngestionRequestOptions {
	updateSearchResult: boolean;
	firebaseOnly: boolean;
	indexedResultsDestination: any;
}


class IngestionWorker extends Worker {
	searchQueueRef: Firebase;
	serviceDispatcher: ServiceDispatcher;
	ingestionWorkers: any;

	constructor (opts: IngestionWorkerOptions) {

		// Default ingestion workers
		let ingestionWorkers = {
			//Genius Ingestion Service adapter
			genius: GeniusServiceIngestionWorker
		}

		this.ingestionWorkers = {};
		if (opts.ingestionWorkers) {
			ingestionWorkers = opts.ingestionWorkers;
		}

		for (var worker in this.ingestionWorkers) {
			let IngestionWorkerClass = opts.ingestionWorkers[worker];
			this.ingestionWorkers[worker] = new IngestionWorkerClass();
		}





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

	/*
	 for (var serviceId in opts.services) {
	 let ServiceClass = opts.services[serviceId];
	 this.serviceProviders[serviceId] = new ServiceClass({
	 provider_id: serviceId,
	 search: this.search,
	 urlHelper: this.urlHelper
	 });
	 }
	*/
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
