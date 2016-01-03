import SearchParser from '../Search/SearchParser';
import Response from '../Models/Response';
import URLHelper from '../Utilities/URLHelper';
import * as _ from 'underscore';
import logger from '../Models/Logger';
import Search from "./Search";

/**
 * This class is responsible for figuring out which service provider must handle a given incoming request.
 * This class calls the 'execute' method of an appropriate service provider (as per request) and keeps track of the response.
 */
class SearchRequestDispatcher {
	search: Search;
	urlHelper: URLHelper;
	searchParser: SearchParser;
	serviceProviders: any;

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

		if (_.isUndefined(opts.services) || _.isNull(opts.services)) {
			throw "Services required to instantiate SearchRequestDispatcher";
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

	getRelevantProviders (filter: string) {
		if (filter === "") {
			return Object.keys(this.serviceProviders);

		} else if (!_.isUndefined(this.serviceProviders[filter])) {
			return [filter];

		} else {
			return [];

		}
	}

	processQueryUpdate ({request, response, resolve, reject}) {
		var { filter, actualQuery } = this.searchParser.parse(request.query.text);
		
		/* whether the query is for autocomplete suggestions */
		var isAutocomplete = !!request.query.autocomplete;

		var promise = (isAutocomplete) ? 
			this.search.suggest(filter, actualQuery) :
			this.search.query(actualQuery, filter);

		promise.then( (data) => { 
			response.updateResults(data);
			logger.profile(request);

			if(request.servicesLeftToProcess === 0 || !!request.query.autocomplete) {
				this.doneProcessingRequest({request, response});
			}

			resolve(true);
		});
	}

	doneProcessingRequest({request, response}) {
		response.complete();
		logger.info('SearchRequestDispatcher:proces()', 'request completed');
	}

	/**
	 * Determines which service provider the request should be executed with and executes it.
	 * @param {object} incomingRequest - contains information about an incoming request.
	 *
	 * @return {Promise} -- Resolves to true when all service callbacks have completed
	 */
	process (request: any) {
		return new Promise((resolve, reject) => {
			logger.profile(request);
			logger.info('SearchRequestDispatcher:process()', 'request started processing', request);
			var { filter, actualQuery } = this.searchParser.parse(request.query.text);


			/* whether the query is for autocomplete suggestions */
			var isAutocomplete = !!request.query.autocomplete;

			/* store the total number of services left to process */
			request.relevantProviders = this.getRelevantProviders(filter);
			request.servicesLeftToProcess = request.relevantProviders.length;
			
			var response = new Response({
				id: request.id
			});

			response.set('id', 'id');
			response.set({
				query: request.query.text,
				doneUpdating: false,
				autocomplete: isAutocomplete
			});
			this.processQueryUpdate({request, response, resolve, reject});

			if (!isAutocomplete) {
				/* Execute the request every user provider that the user is subscribed */
				for (let providerName of request.relevantProviders) {
					this.serviceProviders[providerName].execute({actualQuery}).then((fulfilled:any) => {
						request.servicesLeftToProcess--;
						this.processQueryUpdate({request, response, resolve, reject});

					}).catch((rejected:any) => {
						request.servicesLeftToProcess--;
					});
				}
			}

			// if nothing happens after 2 seconds: timeout
			setTimeout(() => {
				if (!response.get('doneUpdating')) {
					reject(false);
				}
				this.doneProcessingRequest({request, response});
			}, 8000, 'timeout');
		});
		
	}
}

export default SearchRequestDispatcher;
