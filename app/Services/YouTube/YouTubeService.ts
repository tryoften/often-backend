import 'backbonefire';
import ServiceBase from '../ServiceBase';
import { Settings as settings } from './config';
import { Service as RestService } from 'restler';
import logger from '../../Models/Logger';
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
	constructor (opts) {

		super(opts);
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
			this.rest.get(`${settings.base_url}/search`, {
				query: {
					q: query,
					key: settings.api_key,
					part: 'snippet',
					type: 'video'
				}
			}).on('success', data => {
				var videoIds = [];
				for (let item of data.items) {
					videoIds.push(item.id.videoId);
				}

				this.rest.get(`${settings.base_url}/videos`, {
					query: {
						id: videoIds.join(','),
						key: settings.api_key,
						part: 'snippet, statistics',
						type: 'video'
					}
				}).on('success', videoData => {
					var videos = [];
					var results: any = {};

					for (let item of videoData.items) {
						videos.push({
							id: item.id,
							external_url: 'https://www.youtube.com/watch?v=' + item.id ,
							title: item.snippet.title,
							description: item.snippet.description,
							channel_title: item.snippet.channelTitle,
							thumbnail: item.snippet.thumbnails.default.url,
							published: item.snippet.publishedAt,
							viewCount: parseInt(item.statistics.viewCount),
							likeCount: parseInt(item.statistics.likeCount),
							dislikeCount: parseInt(item.statistics.dislikeCount),
							favoriteCount: parseInt(item.statistics.favoriteCount),
							commentCount: parseInt(item.statistics.commentCount)
						});
					}
					this.shortenUrls(videos);
					results.video = videos;
					logger.info('YouTubeService.fetchData(): query: %s, tracks: %s', query, JSON.stringify(videos));
					resolve(results);

				}).on('error', err => {
					console.log('err', err);
					reject(err);
				});

			}).on('error', err => {
				console.log('err' + err);
				reject(err);
			});
		});

	}


}

export default YouTubeService;

