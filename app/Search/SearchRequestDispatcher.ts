import SearchParser from '../Search/SearchParser';
import { Response } from '../Models/Response';
import URLHelper from '../Utilities/URLHelper';
import * as _ from 'underscore';
import logger from '../Models/Logger';
import Search from "./Search";
import Request from "../Models/Request";
import RequestType from "../Models/RequestType";
import MediaItemSource from "../Models/MediaItemSource";

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

	getProviders () : MediaItemSource[] {
		return <MediaItemSource[]> Object.keys(this.serviceProviders);
	}

	processQueryUpdate (request: Request, response: Response, resolve: any , reject: any) {

		var promise = (request.type == RequestType.autocomplete) ?
			this.search.suggest(request.query):
			this.search.query(request.query);

		promise.then( (data: any) => {
			response.updateResults(data);

			if(request.providersLeftToProcess === 0 || !!(request.type == RequestType.autocomplete)) {
				this.completeResponse(response);
			}

			resolve(true);
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
			response.syncData().then(() => {
				logger.info('SearchRequestDispatcher:process()', 'request started processing', request);
				//TODO(jakub): Figure out why the save doesn't propagate to firebase right away.
				request.initProviders(Object.keys(this.serviceProviders));

				this.processQueryUpdate(request, response, resolve, reject);
				request.removeProvider("genius");
/*
				if (request.type != RequestType.autocomplete) {
					//Execute the request every user provider that the user is subscribed
					for (var providerName of request.providers) {
						this.serviceProviders[<string>providerName].execute(request.query).then((fulfilled:any) => {
							request.removeProvider(providerName);
							this.processQueryUpdate(request, response, resolve, reject);

						}).catch((rejected:any) => {
							request.removeProvider(providerName);
						});
					}
				}

				// if nothing happens after 2 seconds: timeout
				setTimeout(() => {
					if (!response.get('doneUpdating')) {
						reject(false);
					}
					this.completeResponse(response);
				}, 8000, 'timeout');
*/
			});

		});

	}
}

export default SearchRequestDispatcher;
