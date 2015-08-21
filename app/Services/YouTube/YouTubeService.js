import 'backbonefire';
import ServiceBase from '../ServiceBase';
import { Settings as settings } from './config';
import { Service as RestService, parsers } from 'restler';

/** 
 * This class is responsible for fetching data from the Giphy API
 */
class YouTubeService extends ServiceBase {
	
	/**
	 * Initializes the youtube service provider.
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

			var results = {};
			this.rest.get(settings.base_url, {
				query: {
					q : query,
					key: settings.api_key,
					part : 'snippet',
					type : 'video'
				}
			}).on('success', data => {
				var videoResults = data.items;
				var videos = [];
				for (let i in videoResults) {
					videos.push({
						id : videoResults[i].id.videoId,
						link : `youtu.be/${ videoResults[i].id.videoId }`,
						title : videoResults[i].snippet.title,
						channel_title : videoResults[i].snippet.channelTitle,
						thumbnail : videoResults[i].snippet.thumbnails.default.url
					});
				}
				results.video = videos;
				resolve(results);
			}).on('error', err => {
				console.log('err' + err);
				reject(err);
			});
		});

	}


}

export default YouTubeService;

