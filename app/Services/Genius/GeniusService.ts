import { GeniusData, GeniusTrackData, GeniusArtistData, GeniusLyricData, GeniusServiceResult } from './GeniusDataTypes';
import { Lyric } from '../../Models/Lyric';
import { Settings as settings } from './config';
import { Service as RestService } from 'restler';
import { generate as generateId } from 'shortid';
import ServiceBase from '../ServiceBase';
import logger from '../../Models/Logger';
import Artist from '../../Models/Artist';
import Track from '../../Models/Track';
<<<<<<< HEAD
import { Lyric, LyricAttributes } from '../../Models/Lyric';
import MediaItemSource from '../../Models/MediaItemSource';
import MediaItemType from '../../Models/MediaItemType';
import { Indexable } from '../../Interfaces/Indexable';
=======
import MediaItemSource from '../../Models/MediaItemSource';
import MediaItemType from '../../Models/MediaItemType';
import * as _ from 'underscore';
import 'backbonefire';
>>>>>>> b78382e54fa7ef37a4e8567ee9dc82b3d6411d45

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

	 fetchData (query: string) : [Indexable] {
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
					let geniusServiceResults =  <[GeniusServiceResult]>categorizedData;
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

					/* Otherwise, fetch and update lyrics as well */
					return this.fetchLyrics(trackId).then( res => {
						data.lyrics = res.data;

						// Update backend DB with latest genius data
						artist.setGeniusData(data);
						track.setGeniusData(data);

						for (let lyric of res.models) {
							lyric.setGeniusData(data)
						}

						// update lyrics here
						console.log('resolving ', trackId);
						resolve({artist, track, lyrics: res.models});
					});
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
	private fetchLyrics (trackId: string): Promise<{ models: Lyric[], data: GeniusLyricData[] }> {
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
			let lyric = new Lyric({
				id: lyricData.id,
				text: lyricData.text,
				score: lyricData.score,
				source: MediaItemSource.Genius,
				type: MediaItemType.lyric
			});
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

		function generateLyric(text: string, score = 0): GeniusLyricData {
			return {
				id: generateId(),
				text: text,
				score: score
			};
		}

		var filtered: GeniusLyricData[] = [];
		for (var lyric of lyrics) {

			if (lyric.text.length === 0) {
				continue;
			}

			if (lyric[0] === "[") {
				/* If lyric starts with bracket then its just a verse indicator, don't ingest */
				continue;
			}

			if (lyric.text.indexOf(" ") === -1) {
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
							filtered.push(generateLyric(lyric.text.substring(start, end+1).trim(), lyric.score));
							start = end+1;
							currSplit = splitInterval;
						}
					}
					end++;
				}
				if (start != end) {
					filtered.push(generateLyric(lyric.text.substring(start, end+1).trim(), lyric.score));
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
			console.log(`${settings.base_url}/songs/${songId}`);
			this.rest.get(`${settings.base_url}/songs/${songId}`, {
				query: {
					access_token: settings.access_token
				}
			}).on('success', data => {

				/* check response code */
				if (data.meta.status !== 200) {
					reject('Invalid return status');
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
						if (media.provider === 'youtube') {
							media.id = media.url.split('v=')[1];
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
}

export default GeniusService;
