import CachedResponses from '../Collections/CachedResponses';
import Search from '../Search/Search';

/** 
 *	This class is a base class for all service providers. 
 *	It has an instance of the results collection to which it adds a response after processing.
 *	It also keeps tracks of a cache for the derived class's responses.
 */
class ServiceBase {


	/**
	 * Initializes the service base.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {Void}
	 */
	constructor (models, opts) {
<<<<<<< HEAD
		this.provider_id = opts.provider_name;
		this.fetch_interval = opts.fetch_interval || 30000; //30 second default
		this.search = new Search();
=======
		this.responses = models.responses;
		this.provider_id = opts.provider_name;
		this.fetch_interval = opts.fetch_interval || 30000; //30 second default
		this.cachedResponses = new CachedResponses({provider : opts.provider_name});
>>>>>>> master
	}


	/**
	 * Method for executing a request with a service provider.
	 * @param {object} request - request to be processed
	 *
	 * @return {Void}
	 */
	execute (request, response) {

		var query = request.get('query');
		var requestId = request.id;

		/* Otherwise refresh the cache by obtaining new data from derived class via fetchData method */
		this.fetchData(query).then((results) => {

			/* Create a response based off of returned results and update the cache */
			this.search.index(this.provider_id, results).then((f) => {
				/* Finished indexing */
				console.log('Finished indexing');
				response.set('time_modified', Date.now()); 
			});

		});

	}
}

export default ServiceBase;