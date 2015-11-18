import SearchParser from '../Search/SearchParser';
import Response from '../Models/Response';
import URLHelper from '../Models/URLHelper';
import _ from 'underscore';
import logger from '../Models/Logger';

/**
 * This class is responsible for figuring out which service provider must handle a given incoming request.
 * This class calls the 'execute' method of an appropriate service provider (as per request) and keeps track of the response.
 */
class SearchRequestDispatcher {

	/**
	 * Initializes the client request dispatcher.
	 * @param {object} opts - supporting options
	 * @
	 *
	 * @return {void}
	 */
	constructor (opts = {}) {
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
				search: this.search,
				urlHelper: this.urlHelper
			});
		}
	}

	getRelevantProviders (filter) { 
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

			if(servicesLeftToProcess === 0 || isAutocomplete) {
				done();
			}

			resolve(true);
		});
	}

	/**
	 * Determines which service provider the request should be executed with and executes it.
	 * @param {object} incomingRequest - contains information about an incoming request.
	 *
	 * @return {Promise} -- Resolves to true when all service callbacks have completed
	 */
	process (request) {
		return new Promise((resolve, reject) => {
			logger.profile(request);
			logger.info('SearchRequestDispatcher:process()', 'request started processing', request);
			var { filter, actualQuery } = this.searchParser.parse(request.query.text);

			var done = () => {
				response.complete();
				request = null;
				response = null;
				logger.info('SearchRequestDispatcher:process()', 'request completed');
			};

			/* whether the query is for autocomplete suggestions */
			var isAutocomplete = !!request.query.autocomplete;

			/* store the total number of services left to process */
			var relevantProviders = this.getRelevantProviders(filter);
			var servicesLeftToProcess = relevantProviders.length;
			
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
				for (let providerName of relevantProviders) {
					this.serviceProviders[providerName].execute(request).then( (fulfilled) => {
						servicesLeftToProcess--;
						this.processQueryUpdate({request, response, resolve, reject});

					}).catch( (rejected) => {
						servicesLeftToProcess--;
					});
					
				}


			}

			// if nothing happens after 2 seconds: timeout
			setTimeout(() => {
				if (!response.get('doneUpdating')) {
					reject(false);
				}
				done();
			}, 8000, 'timeout');
		});
		
	}
}

export default SearchRequestDispatcher;
