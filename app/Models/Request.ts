import { Requestable } from '../Interfaces/Requestable';
import Query from './Query';
import RequestType from './RequestType';
import MediaItemSource from './MediaItemSource';
import * as _ from 'underscore';
import { firebase as FirebaseConfig } from '../config';

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for requests.
 */
class Request implements Requestable {

	id: string;
	userId: string;
	creation_time: number;
	query: Query;
	type: RequestType;
	doneUpdating: boolean;
	ingestData: boolean;

	private _providers: string[];
	constructor (attributes: Requestable, options?) {

		if (attributes.id == null) {
			throw new Error('Id has to be set on a request object.');
		}
		this.id = attributes.id;

		if (attributes.creation_time != null) {
			this.creation_time = attributes.creation_time;
		} else {
			this.creation_time = Date.now();
		}

		if (!attributes.query) {
			throw new Error('Query needs to be defined');
		}
		this.query = new Query(attributes.query);

		if (!!attributes.type) {
			this.type = attributes.type;
		} else {
			throw new Error ('Request Type must be specified');
		}

		this.doneUpdating = !!attributes.doneUpdating;

		if (_.isUndefined(attributes.ingestData)) {
			/* The first time, this attribute is not set and it must be initiated to true */
			this.ingestData = true;
		} else {
			this.ingestData = attributes.ingestData;
		}

		this._providers = [];

	}

	get providers () {
		return this._providers;
	}

	get providersLeftToProcess () {
		return this._providers.length;
	}

	removeProvider (provider: MediaItemSource) {
		let index = _.indexOf(this._providers, provider);
			if (index === -1) {
			//TODO(jakub): Possibly throw error here, because tried removing provider. To be decided...
			return;
		}
		this._providers.splice(index, 1);
	}

	initProviders(providers: string[]) {
		if (_.isEmpty(this._providers)) {
			/* if the service providers array hasn't been initialized via the constructor (i.e. is empty) then set it */
			this._providers = providers;
		}
	}




}

export default Request;
