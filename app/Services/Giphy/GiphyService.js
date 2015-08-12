import 'backbonefire';
import ServiceBase from '../ServiceBase';
import { Settings as settings } from './config';
import { Service as RestService, parsers } from 'restler';

/** 
 * This class is responsible for fetching data from the Giphy API
 */
class GiphyService extends ServiceBase {
	
	/**
	 * Initializes the giphy service provider.
	 * @param {object} models - supporting models
	 *
	 * @return {void}
	 */
	constructor (models) {

		super(models, settings);
		this.rest = new RestService({
			baseURL : settings.base_url
		});
	}
	
	/**
	 * Main method for obtaining results from the service provider's API.
	 * @param {object} query - search term
	 *
	 * @return {promise} - Promise that when resolved returns the results of the data fetch, or an error upon rejection.
	 */
	fetchData (query) {

		return new Promise((resolve, reject) => {

			var results = [];
			this.rest.get(settings.base_url, {
				query: {
					q : query,
					api_key: settings.api_key
				}
			}).on('success', data => {
				var gifsArray = data.data;
				for (let i in gifsArray) {
					results.push({
						embed_url : gifsArray[i].embed_url
					});
				}
				resolve(results);
			}).on('error', err => {
				console.log('err' + err);
				reject(err);
			});
		});

	}

}

export default GiphyService;

