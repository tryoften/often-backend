import { GeniusData, GeniusTrackData, GeniusArtistData, GeniusLyricData, GeniusServiceResult } from './GeniusDataTypes';
import { Settings as settings } from './config';
import { Service as RestService } from 'restler';
import ServiceBase from '../ServiceBase';
import Artist from '../../Models/Artist';
import Track from '../../Models/Track';
import { Lyric } from '../../Models/Lyric';
import MediaItemSource from '../../Models/MediaItemSource';
import MediaItemType from '../../Models/MediaItemType';
import startsWith = require('lodash/string/startsWith');
import * as cheerio from 'cheerio';
import * as _ from 'underscore';
import 'backbonefire';
import { IndexedObject } from '../../Interfaces/Indexable';
import Query from '../../Models/Query';

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
	 * Main method for obtaroining results from the service provider's API.
	 * @param {object} query - search term
	 *
	 * @return {promise} - Pmise that when resolved returns the results of the data fetch, or an error upon rejection.
	 */
	public fetchData (query: Query): Promise<IndexedObject[]> {
		return new Promise((resolve, reject) => {

			let results: IndexedObject[] = [];
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
					let geniusServiceResults =  <GeniusServiceResult[]>categorizedData;

					for (let gsr of geniusServiceResults) {

						results.push(gsr.artist.toIndexingFormat());
						results.push(gsr.track.toIndexingFormat());
						for (let lyric of gsr.lyrics) {
							results.push(lyric.toIndexingFormat());
						}
					}

					resolve(results);
				});

			}).on('error', err => {
				console.log('err' + err);
				reject(err);
			});
		});

	}
	ingest (trackIds: string[]): Promise<IndexedObject[]> {
		return new Promise( (resolve, reject) => {
			let results: IndexedObject[] = [];
			var promises = [];

			for (var trackId of trackIds) {
				// Add all songs to songs list
				promises.push(this.getData(trackId));
			}

			Promise.all(promises).then( (categorizedData) => {
				let geniusServiceResults =  <GeniusServiceResult[]>categorizedData;

				for (let gsr of geniusServiceResults) {

					results.push(gsr.artist.toIndexingFormat());
					results.push(gsr.track.toIndexingFormat());
					for (let lyric of gsr.lyrics) {
						results.push(lyric.toIndexingFormat());
					}
				}

				resolve(results);
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
		return new Promise<GeniusServiceResult>( (resolve, reject) => {

			this.getTrackMetadata(trackId)
				.then( (meta: any) => {
					return Promise.all([
						meta,
						Artist.fromType(MediaItemSource.Genius, MediaItemType.artist, meta.artist.genius_id),
						Track.fromType(MediaItemSource.Genius, MediaItemType.track, meta.track.genius_id)
					]);
				})
				.then( promises => {
					var data: GeniusData = promises[0];
					var artist = <Artist> promises[1], track = <Track> promises[2];

					function done(resultData: GeniusServiceResult) {
						// Update backend DB with latest genius data
						artist.set(data.artist);
						track.set(data.track);
						artist.setGeniusData(resultData);
						track.setGeniusData(artist, resultData.lyrics);

						resolve(resultData);
					}

					if (artist.trackExists(trackId)) {
						/* If track exists then just update meta */
						return this.createLyricModelsFromGeniusData(track.lyrics).then(lyrics => {
							done({ artist, track, lyrics });
						});
					}

					/* Otherwise, fetch and update lyrics as well */
					return this.fetchLyrics(data.track.external_url, trackId).then(res => {
						data.lyrics = res.data;

						for (let lyric of res.models) {
							lyric.setGeniusData(data);
						}

						done({artist, track, lyrics: res.models});
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
	private fetchLyrics (trackUrl: string, trackId: string): Promise<{ models: Lyric[], data: GeniusLyricData[] }> {

		var getAnnotationsPromise = new Promise<GeniusLyricData[]>( (resolve, reject) => {

			this.rest.get(`${settings.base_url}/referents`, {
				query: {
					song_id: trackId,
					access_token: settings.access_token,
					per_page: settings.per_page
				}
			}).on('success', data => {
				var lyrics = [];
				if (data.meta.status !== 200) {
					reject(new Error('Invalid return status'));
					return;
				}

				if (data.response.referents.length === 0) {
<<<<<<< HEAD
					console.log('There are no referents');
					resolve([]);
					//reject(new Error('There are no referent lyrics for this track.'));
=======
					resolve([]);
>>>>>>> a7dc8b35e1e4037f429081aef143f0208ddfde2c
					return;
				}

				for (let ref of data.response.referents) {
					var lyric: GeniusLyricData = {
						annotation_id: ref.id,
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
<<<<<<< HEAD
				reject(err);
=======
>>>>>>> a7dc8b35e1e4037f429081aef143f0208ddfde2c
			});

		});

		return Promise.all([
			getAnnotationsPromise,
			this.parseLyricPage(trackUrl, trackId)
		]).then(data => {
			var annotationData = data[0];
			var lyricsDataFromPage = data[1];

			for (let lyric of lyricsDataFromPage) {
				for (let annotation of annotationData) {
					if (annotation.genius_id === lyric.annotation_id) {
						lyric.score = annotation.score;
						lyric.external_url = annotation.external_url;
					}
				}
			}

			return lyricsDataFromPage;
		}).then(this.processLyrics.bind(this));
	}

	private createLyricModelsFromGeniusData(lyricsData: GeniusLyricData[]): Promise<Lyric[]> {
		let promises: Promise<Lyric>[] = [];

		for (let lyricData of lyricsData) {
			// Persist lyric data to backend
			promises.push(Lyric.fromType(MediaItemSource.Genius, MediaItemType.lyric, lyricData.genius_id));
		}

		return Promise.all(promises).then(models => {
			for (var i = 0, len = models.length; i < len; i++) {
				let model = models[i];
				model.set(lyricsData[i]);
				model.save();
			}
			return models;
		});
	}

	/**
	 * Generates `Lyric` objects including IDs
	 *
	 * @param lyricsData
	 * @returns {Promise<{ models: Lyric[], data: GeniusLyricData[] }>}
     */
	private processLyrics(lyricsData: GeniusLyricData[]): Promise<{ models: Lyric[], data: GeniusLyricData[] }> {
		return this.createLyricModelsFromGeniusData(lyricsData).then(models => {
			return { data: lyricsData, models };
		});
	}

	/**
	 * Cleans up raw lyrics by removing lines that don't fit a set of defined criteria.
	 *
	 * @param lyricsData
	 * @returns {Array}
	 */
	private cleanUpLyrics (lyricsData: GeniusLyricData[]): GeniusLyricData[] {
		function generateLyric(text: string, originalLyric: GeniusLyricData): GeniusLyricData {
			var newLyric = _.clone(originalLyric);
			newLyric.text = text;
			return newLyric;
		}

		var filtered: GeniusLyricData[] = [];
		for (let lyric of lyricsData) {
			if (lyric.text.length === 0) {
				continue;
			}

			if (startsWith(lyric.text, '[')) {
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
					genius_id: result.primary_artist.id,
					name: result.primary_artist.name,
					external_url: result.primary_artist.url,
					image_url: result.primary_artist.image_url,
					is_verified: result.primary_artist.is_verified
				};

				this.parseLyricPage(trackInfo.external_url, trackInfo.genius_id);

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

	private parseLyricPage (url: string, trackId: string): Promise<GeniusLyricData[]> {
		return new Promise<GeniusLyricData[]>((resolve, reject) => {
			this.rest.get(url).on('success', data => {
				let $ = cheerio.load(data);
				let elements = $('.lyrics p').toArray();
				if (elements.length) {
					let filteredElements = this.traverseTree(elements[0]);
					for (var i = 0, len = filteredElements.length; i < len; i++) {
						filteredElements[i].genius_id = `${trackId}_${i}`;
					}
					filteredElements = _.uniq(filteredElements, a => a.text);
					resolve(filteredElements);
				}
			});
		});
	}

	private traverseTree(root: CheerioElement): GeniusLyricData[] {
		var lyrics: GeniusLyricData[] = [];

		for (var el of root.children) {
			switch (el.type) {
				case 'text':
					let lyricData: GeniusLyricData = {
						text: el.data,
						score: 0
					};
					if (root.name === 'a') {
						let annotation_id = cheerio(root).data('id');
						if (annotation_id) {
							lyricData.annotation_id = annotation_id;
						}
					}
					lyrics = lyrics.concat(this.cleanUpLyrics([lyricData]));
					break;
				case 'tag':
					if (el.children.length) {
						lyrics = lyrics.concat(this.traverseTree(el));
					}
					break;
			}
		}

		return this.cleanUpLyrics(lyrics);
	}
}

export default GeniusService;
