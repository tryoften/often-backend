import { GeniusData, GeniusTrackData, GeniusArtistData, GeniusLyricData, GeniusServiceResult } from './GeniusDataTypes';
import { Lyric } from '../../Models/Lyric';
import { Settings as settings } from './config';
import { Service as RestService } from 'restler';
import { generate as generateId } from 'shortid';
import ServiceBase from '../ServiceBase';
import logger from '../../Models/Logger';
import Artist from '../../Models/Artist';
import Track from '../../Models/Track';
import MediaItemSource from '../../Models/MediaItemSource';
import MediaItemType from '../../Models/MediaItemType';
import * as _ from 'underscore';
import 'backbonefire';

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
	public fetchData (query: string) {
		return new Promise((resolve, reject) => {

			var results: any = {};
			this.rest.get(`${settings.base_url}/search`, {
				query: {
					q: query,
					access_token: settings.access_token
				}
			}).on('success', data => {
				/* check response code */
				if (data.meta.status !== 200) {
					reject('Invalid return status');
				}

				var promises = [];

				for (var result of data.response.hits) {
					// Add all songs to songs list
					promises.push(this.getData(result.result.id));
				}

				Promise.all(promises).then( (categorizedData) => {
					console.log('resolved all');
					results = {
						artist: [],
						track: [],
						lyric: []
					};

					for (var res of categorizedData) {
						results.artist.push(res.artist);
						results.track.push(res.track);
						if (!_.isUndefined(res.lyric)) {
							for (var lyr of res.lyric) {
								results.lyric.push(lyr);
							}
						}
					}

					console.log('about to return');
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
	 * @param trackId - genius track ID
	 * @returns {Promise<GeniusData>} promise that resolves with an object containing all fetched metadata
     */
	public getData (trackId: string): Promise<GeniusServiceResult> {
		return new Promise( (resolve, reject) => {

			this.getTrackMetadata(trackId)
				.then( (meta: any) => {
					return Promise.all([
						meta,
						Artist.fromType(MediaItemSource.Genius, MediaItemType.artist, meta.artist.id),
						Track.fromType(MediaItemSource.Genius, MediaItemType.track, meta.track.id)
					]);
				})
				.then( promises => {
					var data: GeniusData = promises[0];
					var artist = <Artist> promises[1], track = <Track> promises[2];

					if (artist.trackExists(trackId)) {
						// Update backend DB with latest genius data
						artist.setGeniusData(data);
						track.setGeniusData(data);

						/* If track exists then just update meta */
						return resolve({
							artist,
							track,
							lyrics: this.createLyricModelsFromGeniusData(track.lyrics)
						});
					}

					let callback = function(res) {
						data.lyrics = res.data;

						// Update backend DB with latest genius data
						artist.setGeniusData(data);
						track.setGeniusData(data);

						for (let lyric of res.models) {
							lyric.setGeniusData(data);
						}

						// update lyrics here
						console.log('resolving ', trackId);
						resolve({artist, track, lyrics: res.models});
					};

					/* Otherwise, fetch and update lyrics as well */
					return this.fetchLyrics(artist, track, trackId).then(callback);
				})
				.catch( err => {
					console.log('rejecting ', trackId, err);
					reject(err);
				});
		});
	}

	/**
	 * Retrieves lyrics for the given genius song ID
	 *
	 * @param {string} trackId the genius song ID
	 * @returns {Promise<string[]>}
	 */
	private fetchLyrics (artist: Artist, track: Track, trackId: string): Promise<{ models: Lyric[], data: GeniusLyricData[] }> {
		return new Promise<GeniusLyricData[]>( (resolve, reject) => {

			this.rest.get(`${settings.base_url}/referents`, {
				query: {
					song_id: trackId,
					access_token: settings.access_token,
					per_page: settings.per_page
				}
			}).on('success', data => {
				var lyrics = [];
				/* check response code */
				if (data.meta.status !== 200) {
					reject(new Error('Invalid return status'));
					return;
				}

				if (data.response.referents.length === 0) {
					reject(new Error('There are no referent lyrics for this track.'));
					return;
				}

				for (let ref of data.response.referents) {
					var lyric: GeniusLyricData = {
						id: generateId(),
						genius_id: ref.id,
						external_url: ref.url,
						text: ref.fragment,
						score: 0
					};

					if (ref.annotations.length > 0) {
						var annotation = ref.annotations[0];
						lyric.score = annotation.votes_total;

						if (annotation.state === 'accepted') {
							lyric.score += 2;
						}
					}

					lyrics.push(lyric);
				}

				resolve(lyrics);
			}).on('error', err => {
				console.log('err' + err);
				reject(err);
			});

		}).then(this.processLyrics.bind(this));
	}

	private createLyricModelsFromGeniusData(lyricsData: GeniusLyricData[]): Lyric[] {
		let models: Lyric[] = [];

		for (let lyricData of lyricsData) {
			// Persist lyric data to backend
			let lyric = new Lyric(_.extend({
				source: MediaItemSource.Genius,
				type: MediaItemType.lyric
			}, lyricData));
			lyric.registerToIdSpace(lyricData.genius_id);
			lyric.save();
			models.push(lyric);
		}
		return models;
	}

	/**
	 * Generates `Lyric` objects including IDs
	 *
	 * @param lyricsData
	 * @returns {Promise<{ models: Lyric[], data: GeniusLyricData[] }>}
     */
	private processLyrics(lyricsData: GeniusLyricData[]): Promise<{ models: Lyric[], data: GeniusLyricData[] }> {
		return new Promise<{ models: Lyric[], data: GeniusLyricData[] }>( (resolve, reject) => {
			lyricsData = this.cleanUpLyrics(lyricsData);
			resolve({ data: lyricsData, models: this.createLyricModelsFromGeniusData(lyricsData) });
		});
	}

	/**
	 * Cleans up raw lyrics by removing lines that don't fit a set of defined criteria.
	 *
	 * @param lyrics
	 * @returns {Array}
	 */
	private cleanUpLyrics (lyrics: GeniusLyricData[]): GeniusLyricData[] {
		function generateLyric(text: string, originalLyric: GeniusLyricData): GeniusLyricData {
			var newLyric = _.clone(originalLyric);
			newLyric.text = text;
			return newLyric;
		}

		var filtered: GeniusLyricData[] = [];
		for (var lyric of lyrics) {

			if (lyric.text.length === 0) {
				continue;
			}

			if (lyric[0] === '[') {
				/* If lyric starts with bracket then its just a verse indicator, don't ingest */
				continue;
			}

			if (lyric.text.indexOf(' ') === -1) {
				/* If lyric is composed of only one word then it's too short, don't ingest */
				continue;
			}

			// if contains newline characters
			if (lyric.text.indexOf('\n') !== -1) {
				var splitInterval = 2;
				var currSplit = splitInterval;
				var start = 0;
				var end = 0;
				for (var i = 0; i < lyric.text.length; i++) {
					if (lyric[i] === '\n') {
						currSplit--;
						if (!currSplit) {
							filtered.push(generateLyric(lyric.text.substring(start, end + 1).trim(), lyric));
							start = end + 1;
							currSplit = splitInterval;
						}
					}
					end++;
				}
				if (start !== end) {
					filtered.push(generateLyric(lyric.text.substring(start, end + 1).trim(), lyric));
				}
			} else {
				lyric.text.trim();
				filtered.push(lyric);
			}
		}
		return filtered;
	}

	/**
	 * Gets only track data for the given track ID
	 *
	 * @param songId
	 * @returns {Promise<T>}
     */
	private getTrackMetadata (songId: string): Promise<{track: GeniusTrackData, artist: GeniusArtistData}> {
		return new Promise( (resolve, reject) => {
			let url = `${settings.base_url}/songs/${songId}`;
			console.log('Getting track metadata. url: ', url);

			this.rest.get(url, {
				query: {
					access_token: settings.access_token
				}
			}).on('success', data => {
				if (data.meta.status !== 200) {
					reject(new Error('Invalid return status'));
					return;
				}

				let result: any = data.response.song;

				let trackInfo: GeniusTrackData = {
					id: generateId(),
					genius_id: result.id,
					title: result.title,
					external_url: result.url,
					header_image_url: result.header_image_url,
					song_art_image_url: result.song_art_image_url,
					hot: result.stats.hot
				};

				if (result.album) {
					trackInfo.album_id = result.album.id;
					trackInfo.album_name = result.album.name;
					trackInfo.album_url = result.album.url;
					trackInfo.album_cover_art_url = result.album.cover_art_url;
				}

				if (result.media) {
					trackInfo.media = {};
					for (var media of result.media) {
						// TODO(luc): identify available service id and register in idspace collection
						if (media.provider === 'youtube') {
							media.id = media.url.split('v=')[1];
						}
						trackInfo.media[media.provider] = media;
					}
				}

				let artistInfo: GeniusArtistData = {
					id: generateId(),
					genius_id: result.primary_artist.id,
					name: result.primary_artist.name,
					external_url: result.primary_artist.url,
					image_url: result.primary_artist.image_url,
					is_verified: result.primary_artist.is_verified
				};

				resolve({
					track: trackInfo,
					artist: artistInfo
				});
			}).on('error', err => {
				console.log('err' + err);
				reject(err);
			});

		});
	}
}

export default GeniusService;
