import CachedResponses from '../Collections/CachedResponses';

/* 
	This class is a base class for all service providers. 
	It has an instance of the results collection to which it adds a response after processing.
	It also keeps tracks of a cache for the derived class's responses.
*/

class ServiceBase {

	/* 
		Description: Initializes the service base.
		Parameters: Models (supporting models), options (supporting options)
		Signature: (Object, Object) -> Void
	*/

	constructor (models, opts) {
		this.responses = models.responses;
		this.provider_id = opts.provider_name;
		this.fetch_interval = opts.fetch_interval || 30000; //30 second default
		this.cachedResponses = new CachedResponses({provider : opts.provider_name});
	}

	/* 
		Description: 
			If response for the request has been cached and the cache for that response is still valid, then cached response is returned.
			Else, the request is processed in the derived class, the cache of the response is updated, and a new response is returned.
		Parameter: Datetime in milliseconds from the start of the epoch.
		Signature: (Object) -> Void
	*/

	execute (request) {

		var query = request.get('query');
		var requestId = request.id;

		/* Sync the cache */
		this.cachedResponses.once('sync', (cr) => {

			/* Check if the cache for the query is valid */
			if (this.cachedResponses.isCacheValid(this.fetch_interval, query)) {

				/* If so create a response based off of cached results */
				var results = this.cachedResponses.getResults(query);
				this.responses.createResponse(requestId, this.provider_id, results);

			} else {

				/* Otherwise refresh the cache by obtaining new data from derived class via fetchData method */
				this.fetchData(query).then((results) => {

					/* Create a response based off of returned results and update the cache */
					var response = this.responses.createResponse(requestId, this.provider_id, results);
					this.cachedResponses.cacheResponse(query, response);

				});

			}

		});

		/* Force the sync event to occur in case the cache is empty */
		this.cachedResponses.fetch();	
	}
}

export default ServiceBase;