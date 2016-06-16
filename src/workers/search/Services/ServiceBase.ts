import URLHelper from '../Utilities/URLHelper';
import Search from '../Search/Search';
import { Service as RestService } from 'restler';
import {IndexableObject} from '../Interfaces/Indexable';
import Query from '../Models/Query';
// export interface ServiceProviderOptions {
//	provider_id: string;
//	fetch_interval?: number;
//	search?: Search;
//	urlHelper?: URLHelper;
// }

/** 
 *	This class is a base class for all service providers. 
 *	It has an instance of the results collection to which it adds a response after processing.
 *	It also keeps tracks of a cache for the derived class's responses.
 */
class ServiceBase {
	provider_id: string;
	fetch_interval: number;
	search: Search;
	urlHelper: URLHelper;
	rest: RestService;

	/**
	 * Initializes the service base.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {Void}
	 */
	constructor (opts: {provider_id: string, fetch_interval?: number, search?: Search, urlHelper?: URLHelper}) {
		this.provider_id = opts.provider_id;
		this.fetch_interval = opts.fetch_interval || 30000; // 30 second default
		this.search = opts.search;
		this.urlHelper = opts.urlHelper;
	}

	/**
	 * Method for executing a request with a service provider.
	 * @param {object} request - request to be processed
	 *
	 * @return {Void}
	 */
	execute (query: Query) {

		/* Otherwise refresh the cache by obtaining new data from derived class via fetchData method */
		return this
			.fetchData(query)
			.then((results) => {
				console.log('results after fetch are: ' + results);
				/* Create a response based off of returned results and update the cache */
				return this.search.index(results);
			});
	}

	fetchData (query: Query): Promise<IndexableObject[]>  {
		throw new Error('fetchData not implemented');
	}

	/**
	 * Shortens the url (specified by prop) of each results object 
	 *
	 * @return {Void}
	 */
	shortenUrls (results, prop = 'external_url') {
		for (var res of results) {
			res[prop] = this.shortenUrl(res[prop]);
		}
	}

	/**
	 * Shortens and replaces the url denoted by prop of a result object with a shorter one
	 * @param {string} link - long url
	 *
	 * @return {promise} - Returns a promise that resolves to an object containing shortened_url or error, when rejected.
	 */
	shortenUrl (link) {
		return this.urlHelper.shortenUrl(link);
	}

}

export default ServiceBase;
