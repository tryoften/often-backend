import Search from '../Search/Search';
import URLHelper from '../Models/URLHelper';
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
		this.urlHelper = new URLHelper();
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

	/**
	 * Shortens the url (specified by prop) of each results object 
	 * @param {[object]} results - array of results objects
	 * @param {string} prop - property containing the link to be shortened (defaults to external_url)
	 *
	 * @return {promise} - Returns a promise that resolves to an array of results with shortened urls or an error
	 */
	shortenUrls (results, prop = 'external_url') {
		var promises = [];
		for (let res of results) {
			promises.push(this.shortenUrl(res, prop));
		}
		return Promise.all(promises);

	}

	/**
	 * Shortens and replaces the url denoted by prop of a result object with a shorter one
	 * @param {object} result - result object
	 * @param {string} prop - property containing the link to be shortened
	 *
	 * @return {promise} - Returns a promise that resolves to an object containing shortened_url or error, when rejected.
	 */
	shortenUrl (result, prop) {
		return new Promise( (resolve, reject) => {
			this.urlHelper.minifyUrl(result[prop]).then( (shortUrl) => {
				result[prop] = shortUrl;
				resolve(result);

			}).catch( (err) => { reject(err); });
		});

	}

}

export default ServiceBase;