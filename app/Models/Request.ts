import {Requestable} from "../Interfaces/Requestable";
import Query from "./Query";
import RequestType from "./RequestType";
import MediaItemSource from "./MediaItemSource";
import * as _ from 'underscore';
/**
 * This class is responsible for providing granular functionalities (mostly accessors) for requests.
 */
class Request implements Requestable {

	id: string;
	userId: string;
	creation_time: number;
	query: Query;
	type: RequestType;
	filters: MediaItemSource[];
	private _providers: string[];

	constructor (attributes: Requestable, options?) {

		if (attributes.query == null) {
			throw new Error('Query needs to be defined');
		}
		this.query = new Query(attributes.query)
		delete attributes.query;

		if (attributes.creation_time == null) {
			this.creation_time = Date.now();
		}
		/* Look at special cases */
		if (attributes.filters == null) {
			this.filters = [];
			this._providers = [];
			delete attributes.filters;
		} else {
			//TODO(jakub): Filter out the providers from filters to exclude feeds
			/* copy all filter properties to service properties */
			this._providers = _.extend(attributes.filters)
		}

		/* Copy remaining attributes normally */
		for (var key in attributes) {
			this[key] = attributes[key];
		}


	}

	get providers () {
		return this._providers;
	}

	get providersLeftToProcess () {
		return this._providers.length;
	}

	removeProvider (provider: MediaItemSource) {
		let index = _.indexOf(this._providers, provider);
			if (index == -1) {
			//TODO(jakub): Possibly throw error here, because tried removing provider. To be decided...
			return;
		}
		this._providers.splice(index,1);
	}

	initProviders(providers: string[]) {
		if (_.isEmpty(this._providers)) {
			/* if the service providers array hasn't been initialized via the constructor (i.e. is empty) then set it */
			this._providers = providers;
		}
	}




}

export default Request;
