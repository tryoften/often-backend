import Worker from './Worker';
import { firebase as FirebaseConfig } from '../config';
import GeniusService from '../Services/Genius/GeniusService';
import * as _ from 'underscore';
import Search from '../Search/Search';
import Firebase = require('firebase');
import Request from '../Models/Request';
import { Requestable } from '../Interfaces/Requestable';
import ServiceDispatcher from '../Models/ServiceDispatcher';
import GeniusServiceIngestionAdapter from '../Adapters/GeniusServiceIngestionAdapter';
import IngestionAdapter from '../Adapters/Ingestion/IngestionAdapter';

class IngestionServiceAdapterType extends String {
	static genius: IngestionServiceAdapterType = 'genius';
}


interface IngestionWorkerOptions {
	searchQueueRef: Firebase;
	ingestionAdapters: IngestionAdapter[];
}

interface IngestionRequestOptions {
	updateSearchResult: boolean;
	firebaseOnly: boolean;
	indexedResultsDestination: any;
}


class IngestionWorker extends Worker {
	searchQueueRef: Firebase;
	serviceDispatcher: ServiceDispatcher;
	ingestionAdapters: IngestionAdapter[];

	constructor (opts: IngestionWorkerOptions) {

		super();

		/* Put insantiation logic here */

		let ingestionAdapters = [
			GeniusServiceIngestionAdapter
		];

		this.ingestionAdapters = [];
		if (opts.ingestionAdapters) {
			ingestionAdapters = opts.ingestionAdapters;
		}

		for (var adapter of this.ingestionAdapters) {
			let IngestionAdapterClass = opts.ingestionAdapters[adapter];
			this.ingestionAdapters[adapter] = new IngestionAdapterClass();
		}


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
