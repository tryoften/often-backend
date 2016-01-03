import 'backbonefire';
import ServiceBase from '../ServiceBase';
import { Settings as settings } from './config';
import { Service as RestService, parsers } from 'restler';

/** 
 * This class is responsible for fetching data from the Giphy API
 */
class GiphyService extends ServiceBase {
	rest: any;

	/**
	 * Initializes the giphy service provider.
	 *
	 * @return {void}
	 */
	constructor (settings) {
		super(settings);
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
			var results: any = {};
			this.rest.get(settings.base_url, {
				query: {
					q : query,
					api_key: settings.api_key
				}
			}).on('success', data => {
				var gifs = [];
				var gifsArray = data.data;
				for (let i in gifsArray) {
					gifs.push({
						id : gifsArray[i].id,
						embed_url : gifsArray[i].embed_url
					});
				}
				results.gif = gifs;
				resolve(results);
			}).on('error', err => {
				console.log('err' + err);
				reject(err);
			});
		});

	}
}

export default GiphyService;

