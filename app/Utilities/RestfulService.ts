import { Service, parsers } from 'restler';

/* 
	This class is responsible for fetching data from the Giphy API
*/

class RestfulService extends Service {
	
	/* 
		Description: Initializes the giphy service provider.
		Parameters: Models (supporting models)
		Signature: (Object) -> Void
	*/

	constructor (opts) {
		super({
			baseURL: opts.base_url,
			parser: parsers.json
		});
	}
	
	/* 
		Description: Main method for obtaining raw data. Results are returned as a promise.
		Parameters: Query (search term)
		Signature: (String) -> Promise
	*/

	getRawData (url, opts) {

		return new Promise((resolve, reject) => {
			this.get(url, {
				query : opts
			}).on('success', data => {
				resolve(data);
			}).on('error', err => {
				console.log('err' + err);
				reject(err);
			});
		});

	}
}

export default RestfulService;

