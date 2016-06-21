import SearchParser from '../Search/SearchParser';
import Response from '../Models/Response';
import URLHelper from '../Utilities/URLHelper';
import * as _ from 'underscore';
import logger from '../logger';
import Search from './Search';
import Request from '../Models/Request';
import RequestType from '../Models/RequestType';
import MediaItemSource from '../Models/MediaItemSource';
import Filters from '../Collections/Filters';
import FilterType from '../Models/FilterType';

/**
 * This class is responsible for figuring out which service provider must handle a given incoming request.
 * This class calls the 'execute' method of an appropriate service provider (as per request) and keeps track of the response.
 */
class SearchRequestDispatcher {
	search: Search;
	urlHelper: URLHelper;
	searchParser: SearchParser;
	serviceProviders: any;
	filters: Filters;

	/**
	 * Initializes the client request dispatcher.
	 * @param {object} opts - supporting options
	 * @
	 *
	 * @return {void}
	 */
	constructor (opts: any = {}) {
		this.search = opts.search;
		this.urlHelper = new URLHelper();
		this.searchParser = new SearchParser();
		this.filters = new Filters();

		if (_.isUndefined(opts.services) || _.isNull(opts.services)) {
			throw 'Services required to instantiate SearchRequestDispatcher';
		}

		/* service provider name to service instances map */
		this.serviceProviders = {};

		for (var serviceId in opts.services) {
			let ServiceClass = opts.services[serviceId];
			this.serviceProviders[serviceId] = new ServiceClass({
				provider_id: serviceId,
				search: this.search,
				urlHelper: this.urlHelper
			});
		}
	}

	getProviders (): MediaItemSource[] {
		return <MediaItemSource[]> Object.keys(this.serviceProviders);
	}

	processQueryUpdate (request: Request, response: Response, resolve: any , reject: any) {

		var promise: Promise<any> = (() => {
			switch (request.type) {
				case RequestType.autocomplete:

					switch (!!request.query.filter) {
						case true:

							switch (request.query.filter.type) {
								case FilterType.searchTerms:
									return this.search.getTopSearches(request.query.filter.value);

								case FilterType.general:
									return new Promise((resolve, reject) => {
										resolve(this.filters.suggestFilters(request.query.filter));
									});
							}
							break;

						default:
							/* If no filter type specified, then execute autocomplete suggestions */
							return this.search.suggest(request.query);

					}
					break;

				case RequestType.search:
					return this.search.query(request.query);

				default:
					throw new Error('Invalid request type');

			}
		})();

		promise.then( (data: any) => {
			console.log('in processing mode')
			response.updateResults(data);

			if (request.doneUpdating) {
				this.completeResponse(response);
			}

			resolve(true);
		}).catch(err => {
			console.log('erry');
			console.log('Caught error in query: ' + err.stack);
		});
	}

	completeResponse(response: Response) {
		response.complete();
		logger.info('SearchRequestDispatcher:process()', 'response completed');
	}

	/**
	 * Determines which service provider the request should be executed with and executes it.
	 * @param {object} incomingRequest - contains information about an incoming request.
	 *
	 * @return {Promise} -- Resolves to true when all service callbacks have completed
	 */
	process (request: Request) {

		return new Promise((resolve, reject) => {

			var response = Response.fromRequest(request);

			logger.info('SearchRequestDispatcher:process()', 'request started processing', request);

			this.processQueryUpdate(request, response, resolve, reject);

			setTimeout(() => {
				if (!response.get('doneUpdating')) {
					reject(false);
				}
				this.completeResponse(response);
			}, 8000, 'timeout');

		});

	}
}

export default SearchRequestDispatcher;
