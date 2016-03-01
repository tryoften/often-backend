import Worker, { Task } from './Worker';
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
import MediaItemType from '../Models/MediaItemType';


export class DestinationType extends String {
	static Firebase: DestinationType = 'firebase';
	static ElasticSearch: DestinationType = 'elasticsearch';
}

class IngestionServiceAdapterType extends String {
	static genius: IngestionServiceAdapterType = 'genius';
}

export class InputFormat extends String {
	static Url: InputFormat = 'url';
	static Index: InputFormat = 'index';
	static Id: InputFormat = 'id';
}

export interface ArtistUrl {
	url: string;
	popularTracksOnly: boolean;
}

export interface ArtistIndex {
	index: string;
	popularArtistsOnly: boolean;
	popularTracksOnly: boolean;
}

export type ArtistId = String;
export type TrackId = String;
type Id = number;

export interface IngestionTask extends Task {
	destinations: DestinationType[];
	service: IngestionServiceAdapterType;
	type: MediaItemType;
	format: InputFormat;
	data: (ArtistUrl[] | ArtistUrl) | (ArtistIndex[] | ArtistIndex) | (Id[] | Id);
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

		this.ingestionAdapters = [
			GeniusServiceIngestionAdapter
		];

		if (opts.ingestionAdapters) {
			this.ingestionAdapters = opts.ingestionAdapters;
		}



	}


	public process (data: IngestionTask, progress: any, resolve: any, reject: any) {

		// TODO(jakub): Expand to include multiple services
		return this.ingestionAdapters[data.service].process(data, process, resolve, reject);





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
