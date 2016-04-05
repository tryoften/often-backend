import Worker, { Task } from './Worker';
import * as _ from 'underscore';
import Firebase = require('firebase');
import ServiceDispatcher from '../Models/ServiceDispatcher';
import GeniusServiceIngestionAdapter from '../Adapters/Ingestion/GeniusServiceIngestionAdapter';
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

export class IngestionOption extends String {
	static Trending: IngestionOption = 'trending';
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

export type ArtistId = string;
export type TrackId = string;

interface IngestionWorkerOptions {
	searchQueueRef?: Firebase;
	ingestionAdapters: IngestionAdapter[];
}

export interface IngestionTask extends Task {
	destinations: DestinationType[];
	service: IngestionServiceAdapterType;
	type: MediaItemType;
	format: InputFormat;
	ingestionOption: IngestionOption;
	data: (ArtistUrl[] | ArtistUrl) | (ArtistIndex[] | ArtistIndex) | (TrackId[] | TrackId);
}


class IngestionWorker extends Worker {
	searchQueueRef: Firebase;
	serviceDispatcher: ServiceDispatcher;
	ingestionAdapters: any;
	constructor (opts: IngestionWorkerOptions) {

		super(opts);

		this.ingestionAdapters = {};
		this.ingestionAdapters[<string>IngestionServiceAdapterType.genius] =  new GeniusServiceIngestionAdapter();

		if (opts.ingestionAdapters) {
			this.ingestionAdapters = opts.ingestionAdapters;
		}

	}


	public process (task: IngestionTask, progress: any, resolve: any, reject: any) {

		// TODO(jakub): Expand to include task being handled by multiple servicesß
		this.ingestionAdapters[<string>task.service].process(task, process, resolve, reject);

	}
}

export default IngestionWorker;
