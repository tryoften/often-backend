import 'backbonefire';
import ServiceBase from '../ServiceBase';
import { Settings as settings } from './config';
import logger from '../../Models/Logger';
import { Service as RestService } from 'restler';
import Artist from '../../Models/Artist';
import Track from '../../Models/Track';
import Lyric from '../../Models/Lyric';
/** 
 * This class is responsible for fetching data from the Spotify API
 */
class GeniusService extends ServiceBase {
	
	/**
	 * Initializes the spotify service provider.
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
			this.rest.get(`${settings.base_url}/search`, {
				query: {
					q: query,
					access_token: settings.access_token
				}
			}).on('success', data => {
				/* check response code */
				if (data.meta.status != 200) {
					reject("Invalid return status");
				}

				var promises = [];
				for (var result of data.response.hits) {
					/* Add all songs to songs list */
					promises.push(this.getData(result.result.id));
				}

				Promise.all(promises).then((data) => {
					results = {
						artist: [],
						track: [],
						lyric: []
					}

					for (var res of data) {
						results.artist.push(res.artist);
						results.track.push(res.track);
						results.lyric.push(res.lyric);
					}

					resolve(results);
				});
				
			}).on('error', err => {
				console.log('err' + err);
				reject(err);
			});
		});

	}

	getData (songId) {
		return new Promise( (resolve, reject) => {
			var result = {};
			this.getTrackMeta(songId).then( (meta) => {
				console.log('Processing track metadata');
				var artist = meta.artist;
				var track = meta.track;
				var lyrics = [];
				console.log(artist.id);
				var artistObj = new Artist({ id: artist.id });
				artistObj.on('sync', (artistObj) => {
					if (artistObj.trackExists(songId)) {
						/* if the track does exist then we just need to update artist and track meta */
						result = {
							artist: artistObj.update({artist, track}),
							track: new Track({ id: track.id }).update({artist, track, lyrics})
						}
						
						resolve(result);


					} else {
						console.log('Fetching lyrics');
						/* otherwise, lyrics data will need to be updated as well */
						this.fetchLyrics(songId).then( (lyrics) => {

							result = {
								artist: artistObj.update({artist, track, lyrics}),
								track: new Track({ id: track.id }).update({artist, track, lyrics}),
								lyrics: []
							}

							for (let i = 0; i < lyrics.length; i++) {
								var lyric = lyrics[i];
								result.lyrics.push(new Lyric({ id: `${track.id}_${i}` }).update({artist, track, lyric}));
							}
							
							// update lyrics here
							resolve(result);
						});
					}

				});
				artistObj.fetch();
			});
		});
	}

	getTrackMeta (songId) {

		return new Promise( (resolve, reject) => {
			console.log(`${settings.base_url}/songs/${songId}`);
			this.rest.get(`${settings.base_url}/songs/${songId}`, {
				query: {
					access_token: settings.access_token
				}
			}).on('success', data => {

				/* check response code */
				if (data.meta.status != 200) {
					reject("Invalid return status");
					return;
				}
				var result = data.response.song;
				var info = {
					track: {
						id: result.id,
						title: result.title,
						url: result.url,
						header_image_url: result.header_image_url,
						song_art_image_url: result.song_art_image_url,
						stats: {
							hot: result.stats.hot,
							pageviews: result.stats.pageviews
						},
						album_id: result.album.id,
						album_name: result.album.name,
						album_url: result.album.url,
						album_cover_art_url: result.album.cover_art_url

					}, artist: {
						id: result.primary_artist.id,
						name: result.primary_artist.name,
						url: result.primary_artist.url,
						image_url: result.primary_artist.image_url,
						is_verified: result.primary_artist.is_verified

					}
				}

				resolve(info);

				
			}).on('error', err => {
				console.log('err' + err);
				reject(err);
			});

		});
	}


	fetchLyrics (songId) {

		return new Promise( (resolve, reject) => {

			this.rest.get(`${settings.base_url}/referents`, {
				query: {
					song_id: songId,
					access_token: settings.access_token
				}
			}).on('success', data => {

				var lyrics = [];
				/* check response code */
				if (data.meta.status != 200) {
					reject("Invalid return status");
				}

				for (ref of data.response.referents) {
					 lyrics.push(ref.fragment);
				}

				resolve(lyrics);

				
			}).on('error', err => {
				console.log('err' + err);
				reject(err);
			});

		});
	}







	

}

export default GeniusService;

