import 'backbonefire';
import ServiceBase from '../ServiceBase';
import { Settings as settings } from './config';
import logger from '../../Models/Logger';
import { Service as RestService } from 'restler';
import Artist from '../../Models/Artist';
import Track from '../../Models/Track';
import Lyric from '../../Models/Lyric';
import * as _ from 'underscore';
import { GeniusData, GeniusTrackData, GeniusArtistData, GeniusLyricData } from './GeniusDataTypes';
import { generate as generateId } from 'shortid';

/** 
 * This class is responsible for fetching data from the Genius API
 */
class GeniusService extends ServiceBase {
	/**
	 * Initializes the genius service provider.
	 *
	 * @return {void}
	 */
	constructor (opts: {provider_id: string}) {
		super(opts);
		this.rest = new RestService({
			baseURL: settings.base_url
		});
	}
	
	/**
	 * Main method for obtaining results from the service provider's API.
	 * @param {object} query - search term
	 *
	 * @return {promise} - Promise that when resolved returns the results of the data fetch, or an error upon rejection.
	 */
	 fetchData (query: string) {
		return new Promise((resolve, reject) => {

			var results: any = {};
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

	/**
	 * Gets all metadata for given track ID including artist, album, and lyrics data
	 *
	 * @param songId the genius track ID
	 * @returns {Promise<GeniusData>} promise that resolves with an object containing all fetched metadata
     */
	getData (songId: string): Promise<Track> {
		return new Promise( (resolve, reject) => {

			this.getTrackMetadata(songId)
				.then( (meta: any) => {
					return Promise.all([
						meta,
						new Artist({ genius_id: meta.artist.id }).syncData(),
						new Track({ genius_id: meta.track.id }).syncData()
					]);
				})
				.then( promises => {
					let data: GeniusData = promises[0];
					let artist = <Artist> promises[1], track = <Track> promises[2];

					if (artist.trackExists(songId)) {
						// Update backend DB with latest genius data
						artist.setGeniusData(data, true);
						track.setGeniusData(data);

						/* If track exists then just update meta */
						return resolve(track);
					}

					/* Otherwise, fetch and update lyrics as well */
					return this.fetchLyrics(songId).then( (rawLyrics) => {
						rawLyrics = this.cleanUpLyrics(rawLyrics);
						var lyrics: GeniusLyricData[] = [];

						for (let i = 0; i < rawLyrics.length; i++) {
							let lyricData: GeniusLyricData = {
								id: `${track.id}_${i}`,
								text: rawLyrics[i]
							};
							lyrics.push(lyricData);

							// Persist lyric data to backend
							let lyric = new Lyric(lyricData);
							lyric.setGeniusData({
								artist: data.artist,
								track: data.track,
								lyric: lyricData
							});
						}

						data.lyrics = lyrics;
						data.lyricsCount = lyrics.length;

						// Update backend DB with latest genius data
						artist.setGeniusData(data);
						track.setGeniusData(data);

						// update lyrics here
						console.log('resolving ', songId);
						resolve(track);
					});
				})
				.catch( (err) => {
					console.log('rejecting ', songId, err);
					reject(err);
				});
		});
	}

	/**
	 * Gets only track data for the given track ID
	 *
	 * @param songId
	 * @returns {Promise<T>}
     */
	getTrackMetadata (songId: string): Promise<{track: GeniusTrackData, artist: GeniusArtistData}> {
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

				var result: any = data.response.song;
				
				var info: {track: GeniusTrackData, artist: GeniusArtistData} = {
					track: {
						id: result.id,
						title: result.title,
						url: result.url,
						header_image_url: result.header_image_url,
						song_art_image_url: result.song_art_image_url,
						hot: result.stats.hot
					},
					artist: {
						id: result.primary_artist.id,
						name: result.primary_artist.name,
						url: result.primary_artist.url,
						image_url: result.primary_artist.image_url,
						is_verified: result.primary_artist.is_verified
					}
				};

				if (result.album != null) {
					info.track.album_id = result.album.id;
					info.track.album_name = result.album.name;
					info.track.album_url = result.album.url;
					info.track.album_cover_art_url = result.album.cover_art_url;
				}
				
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

	/**
	 * Retrieves lyrics for the given genius song ID
	 *
	 * @param {string} songId the genius song ID
	 * @returns {Promise<string[]>}
     */
	fetchLyrics (songId: string): Promise<string[]> {
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

	/**
	 * Cleans up raw lyrics by removing lines that dont fit a set of defined criterias.
	 *
	 * @param lyrics
	 * @returns {Array}
     */
	private cleanUpLyrics (lyrics: string[]): string[] {
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

