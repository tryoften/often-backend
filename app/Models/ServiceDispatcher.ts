import SearchParser from '../Search/SearchParser';
import URLHelper from '../Utilities/URLHelper';
import * as _ from 'underscore';
import logger from '../Models/Logger';
import Search from '../Search/Search';
import Request from '../Models/Request';
import MediaItemSource from '../Models/MediaItemSource';
import Filters from '../Collections/Filters';


/**
 * This class is responsible for figuring out which service provider must handle a given incoming request.
 * This class calls the 'execute' method of an appropriate service provider (as per request) and keeps track of the response.
 */
class ServiceDispatcher {
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

	processIngestionResult (request: Request, resolve: any , reject: any) {

		if (request.providersLeftToProcess === 0) {
			request.doneUpdating = true;
		}

		resolve(request);

	}

	/**
	 * Determines which service provider the request should be executed with and executes it.
	 * @param {object} incomingRequest - contains information about an incoming request.
	 *
	 * @return {Promise} -- Resolves to true when all service callbacks have completed
	 */
	process (request: Request) {

		return new Promise((resolve, reject) => {

			logger.info('ServiceDispatcher:process()', 'request started processing', request);
			request.initProviders(Object.keys(this.serviceProviders));

			for (var providerName of request.providers) {
				this.serviceProviders[<string>providerName].execute(request.query).then((fulfilled: any) => {
					request.removeProvider(providerName);
					this.processIngestionResult(request, resolve, reject);

				}).catch((rejected: any) => {
					request.removeProvider(providerName);
				});
			}


			// if nothing happens after 10 seconds: timeout
			setTimeout(() => {
				request.doneUpdating = true;
				reject(request);
			}, 30000, 'timeout');

		});

	}
}

export default ServiceDispatcher;
