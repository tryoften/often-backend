import logger from '../Models/Logger';
import URLHelper from "../Utilities/URLHelper";
import Search from '../Search/Search';

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
	rest: any;

	/**
	 * Initializes the service base.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {Void}
	 */
	constructor ({provider_id, fetch_interval, search, urlHelper}) {
		this.provider_id = provider_id;
		this.fetch_interval = fetch_interval || 30000; //30 second default
		this.search = search;
		this.urlHelper = urlHelper;
	}

	/**
	 * Method for executing a request with a service provider.
	 * @param {object} request - request to be processed
	 *
	 * @return {Void}
	 */
	execute ({actualQuery}) {

		/* Otherwise refresh the cache by obtaining new data from derived class via fetchData method */
		return this
			.fetchData(actualQuery)
			.then((results) => {
				/* Create a response based off of returned results and update the cache */
				return this.search.index(this.provider_id, results);
			});
	}

	fetchData (query): Promise<any> {
		throw new Error("fetchData not implemented");
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
