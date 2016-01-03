import 'backbonefire';
import ServiceBase from '../ServiceBase';
import { Settings as settings } from './config';
import { Service as RestService, parsers } from 'restler';
import logger from '../../Models/Logger';

/** 
 * This class is responsible for fetching data from the Giphy API
 */
class SoundCloudService extends ServiceBase {
	rest: any;
	
	/**
	 * Initializes the soundcloud service provider.
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

			var results = {};
			this.getSoundCloudData(query, results).then(function (data) {
				resolve(results);
			}).catch( (err) => { reject(err); });

		});

	}

	/**
	 * Barrier method for collecting results from multiple service provider API calls.
	 * @param {string} query - search term
	 * @results {object} results - object for storing data from the service provider's
	 *
	 * @return {promise} - Returns a promise when all sub-promises are resolved or an error on rejection.
	 */
	getSoundCloudData (query, results) {

		return Promise.all([
			this.searchTracks(query, results)
		]);
		
	}

	/**
	 * Searches soundlcoud users using query and populates the results object with user information.
	 * @param {string} query - search term
	 * @param {object} results - object for storing data from the service provider's
	 *
	 * @return {promise} - Returns a promise that resolves to either true if resolved or error, when rejected.
	 */
	searchUsers (query, results) {

		return new Promise( (resolve, reject) => {

			this.rest.get(`${ settings.base_url }/users` , {
				query : {
					q : query,
					client_id : settings.client_id
				}
			}).on('success', data => {
				var userResults = data;
				var users = [];
				for (let i in userResults) {
					users.push({
						id : userResults[i].id,
						first_name : userResults[i].first_name,
						last_name : userResults[i].last_name,
						followings_count : userResults[i].followings_count,
						track_count : userResults[i].track_count
					});
				}
				results.user = users;
				resolve(true);
			}).on('error', err => {
				console.log('err' + err);
				reject(err);
			});

		});

	}

	/**
	 * Searches soundcloud tracks using query and populates the results object with track information.
	 * @param {string} query - search term
	 * @param {object} results - object for storing data from the service provider's
	 *
	 * @return {promise} - Returns a promise that resolves to either true if resolved or error, when rejected.
	 */
	searchTracks (query, results) {

		return new Promise( (resolve, reject) => {

			this.rest.get(`${ settings.base_url }/tracks` , {
				query : {
					q : query,
					client_id : settings.client_id
				}
			}).on('success', data => {
				var tracks = [];
				for (let trackResult of data) {
					let track: any = {
						id: trackResult.id,
						name: trackResult.title,
						api_uri: trackResult.uri,
						duration: trackResult.duration,
						image: trackResult.artwork_url,
						description: trackResult.description,
						external_url: trackResult.permalink_url,
						waveform_url: trackResult.waveform_url,
						favorites: trackResult.favoritings_count,
						likes: trackResult.likes_count,
						plays: trackResult.playback_count,
						genre: trackResult.genre,
						created: trackResult.created_at,
					};

					if (trackResult.user !== null) {
						track.user = trackResult.user;
					}

					tracks.push(track);
				}
				this.shortenUrls(tracks);
				results.track = tracks;
				logger.info('Soundcloud.searchTracks(): query: %s, tracks: %s', query, JSON.stringify(tracks));
				resolve(true);

			}).on('error', err => {
				console.log('err' + err);
				reject(err);
			});

		});
	}
}

export default SoundCloudService;

