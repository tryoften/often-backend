import 'backbonefire';
import ServiceBase from '../ServiceBase';
import { Settings as settings } from './config';
import logger from '../../Models/Logger';
import { Service as RestService } from 'restler';
import Artist from '../../Models/Artist';
import Track from '../../Models/Track';
import Lyric from '../../Models/Lyric';
import _ from 'underscore';
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
					//Add all songs to songs list 
					promises.push(this.getData(result.result.id));
				}

				Promise.all(promises).then( (categorizedData) => {
					console.log('resolved all');
					results = {
						artist: [],
						track: [],
						lyric: []
					}

					for (var res of categorizedData) {
						results.artist.push(res.artist);
						results.track.push(res.track);
						if (!_.isUndefined(res.lyric)) {
							for (var lyr of res.lyric) {
								results.lyric.push(lyr);
							}
						}
					}
					console.log("about to return");

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
			
			this.getTrackMeta(songId).then( (meta) => {
				var artist = meta.artist;
				var track = meta.track;
				var artistObj = new Artist({ id: artist.id });
				artistObj.once('sync', (syncedArtist) => {
					var result = {};
					var trackObj = new Track({ id: track.id });
					trackObj.once('sync', (syncedTrack) => {
						
						if (syncedArtist.trackExists(songId)) {
							/* If track exists then just update meta */
							result = {
								artist: syncedArtist.update({artist, track}),
								track: syncedTrack.update({artist, track})
							}

							resolve(result);

						} else {
							/* Otherwise, update lyrics as well */
							this.fetchLyrics(songId).then( (rawLyrics) => {

								var lyrics = this.cleanUpLyrics(rawLyrics);
								result = {
									artist: syncedArtist.update({artist, track, lyrics}),
									track: syncedTrack.update({artist, track, lyrics}),
									lyric: []
								}
								for (let i = 0; i < lyrics.length; i++) {
									var lyric = lyrics[i];
									var lyrObj = new Lyric({ id: `${track.id}_${i}` });
									result.lyric.push(lyrObj.update({artist, track, lyric}));
								}
								
								// update lyrics here
								console.log('resolving ', songId);
								resolve(result);
							}).catch( (err) => {
								console.log('rejecting ', songId);
								reject(err);
							});
						}

					});
					trackObj.fetch();

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
						hot: result.stats.hot

					}, artist: {
						id: result.primary_artist.id,
						name: result.primary_artist.name,
						url: result.primary_artist.url,
						image_url: result.primary_artist.image_url,
						is_verified: result.primary_artist.is_verified

					}
				}

				if (result.album != null) {
					info.track.album_id = result.album.id,
					info.track.album_name = result.album.name,
					info.track.album_url = result.album.url,
					info.track.album_cover_art_url = result.album.cover_art_url
				}
				//console.log(songId);
				
				if (result.media != null) {
					console.log('checking media');
					info.track.media = {};
					for (var media of result.media) {
						if (media.provider == "youtube") {
							media.id = media.url.split("v=")[1];
						}
						info.track.media[media.provider] = media;
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
					access_token: settings.access_token,
					per_page: settings.per_page
				}
			}).on('success', data => {

				var lyrics = [];
				/* check response code */
				if (data.meta.status != 200) {
					reject("Invalid return status");
					return;
				}

				if (data.response.referents.length == 0) {
					reject("There are no referent lyrics for this track.");
					return;
				}

				for (let ref of data.response.referents) {
					lyrics.push(ref.fragment);
				}

				resolve(lyrics);

				
			}).on('error', err => {
				console.log('err' + err);
				reject(err);
			});

		});
	}

	cleanUpLyrics (lyrics) {
		var filtered = [];
		for (var lyr of lyrics) {

			if (lyr.length == 0) {
				continue;
			}

			if (lyr[0] == "[") {
				/* If lyric starts with bracket then its just a verse indicator, don't ingest */
				continue;
			}

			if (lyr.indexOf(" ") == -1) {
				/* If the lyric is composed of only one word then it's too short, don't ingest */
				continue;
			}

			// if contains newline characters
			if (lyr.indexOf('\n') != -1) {
				var splitInterval = 2;
				var currSplit = splitInterval;
				var start = 0;
				var end = 0;
				for (var i = 0; i < lyr.length; i++) {
					if (lyr[i] == '\n') {
						currSplit--;
						if (!currSplit) {
							filtered.push(lyr.substring(start, end+1).trim());
							start = end+1;
							currSplit = splitInterval;
						}
					}
					end++;
				}
				if (start != end) {
					filtered.push(lyr.substring(start, end+1).trim());
				}
			} else {
				filtered.push(lyr.trim());
			}

		}
		return filtered;
	}

}

export default GeniusService;

