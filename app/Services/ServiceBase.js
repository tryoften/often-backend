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
		this.provider_id = opts.provider_name;
		this.fetch_interval = opts.fetch_interval || 30000; //30 second default
		this.search = new Search();
	}

	/**
	 * Method for executing a request with a service provider.
	 * @param {object} request - request to be processed
	 *
	 * @return {Void}
	 */
	execute (request, response) {

		var query = request.query.text;
		var requestId = request.id;

		var onError = (error) => {
			console.log("On Error: ", error);
			response.set({
				time_modified: Date.now()
			}); 
		};

		/* Otherwise refresh the cache by obtaining new data from derived class via fetchData method */
		this.fetchData(query).then((results) => {

			/* Create a response based off of returned results and update the cache */
			this.search.index(this.provider_id, results).then((f) => {

				/* Finished indexing */
				response.set({
					time_modified: Date.now()
				}); 
			}, onError);

		}, onError);

	}
}

export default ServiceBase;