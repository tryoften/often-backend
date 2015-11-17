//import Responses from '../Collections/Responses';
import Search from '../Search/Search';
import SearchParser from '../Search/SearchParser';
import _ from 'underscore';
import { Events } from 'backbone';
import Response from '../Models/Response';
import URLHelper from '../Models/URLHelper';
// import logger from '../Models/Logger';

/**
 * This class is responsible for figuring out which service provider must handle a given incoming request.
 * This class calls the 'execute' method of an appropriate service provider (as per request) and keeps track of the response.
 */
class SearchRequestDispatcher extends Events {

	/**
	 * Initializes the client request dispatcher.
	 * @param {object} opts - supporting options
	 * @
	 *
	 * @return {void}
	 */
	constructor (opts = {}) {
		super();
		this.search = new Search();
		this.urlHelper = new URLHelper();

		if (_.isUndefined(opts.services) || _.isNull(opts.services)) {
			throw "Services required to instantiate SearchRequestDispatcher";
		}

		/* service provider name to service instances map */
		this.serviceProviders = {};

		for (var serviceId in opts.services) {
			this.serviceProviders[serviceId] = opts.services[serviceId]({
				search: this.search,
				urlHelper: this.urlHelper
			});
		}

		this.searchParser = new SearchParser();
		this.on('query', this.processQueryChanges);
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

	processQueryChanges () {

	}

	/**
	 * Determines which service provider the request should be executed with and executes it.
	 * @param {object} incomingRequest - contains information about an incoming request.
	 *
	 * @return {Promise} -- Resolves to true when all service callbacks have completed
	 */
	process (request) {
		return new Promise((resolve, reject) => {
			logger.info('SearchRequestDispatcher', 'process', 'request started processing', request);
			var { filter, actualQuery } = this.searchParser.parse(request.query.text);

			var done = function() {
				logger.info('SearchRequestDispatcher', 'process', 'request completed');
				response.complete();
				request = null;
				response = null;
			};

			/* whether the query is for autocomplete suggestions */
			var isAutocomplete = !!request.query.autocomplete;

			/* store the total number of services left to process */
			var relevantProviders = this.getRelevantProviders(filter);
			var servicesLeftToProcess = relevantProviders.length;
			
			var response = new Response({
				id: request.id
			});
			
			response.set({
				id: request.id,
				query: request.query.text,
				doneUpdating: false,
				autocomplete: isAutocomplete
			});

			this.on('query', () => {
				var promise = (isAutocomplete) ? 
					this.search.suggest(filter, actualQuery) :
					this.search.query(actualQuery, filter);

				promise.then( (data) => { 
					response.updateResults(data);
					if(servicesLeftToProcess === 0 || isAutocomplete) {
						done();
						resolve(true);
					}
				});
			});

			/* Emit query event once */
			this.trigger('query');

			if (!isAutocomplete) {
				/* Execute the request every user provider that the user is subscribed */
				for (let providerName of relevantProviders) {
					this.serviceProviders[providerName].execute(request).then( (fulfilled) => {
						servicesLeftToProcess--;
						this.trigger('query');

					}).catch( (rejected) => {
						servicesLeftToProcess--;
					});
					
				}

				// if nothing happens after 2 seconds: timeout
				setTimeout(() => {
					reject(false);
					done();
				}, 5000, 'timeout');
			} else {
				setTimeout(() => {
					reject(false);
					done();
				}, 1000, 'timeout');
			}
		}).catch( err => { 
			logger.info('SearchRequestDispatcher', 'process', 'request failed', request);
			reject(err); 
		});
		
	}
}

export default SearchRequestDispatcher;
