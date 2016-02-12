import { GeniusData, GeniusTrackData, GeniusArtistData, GeniusLyricData, GeniusServiceResult } from './GeniusDataTypes';
import { Settings as settings } from './config';
import { Service as RestService } from 'restler';
import ServiceBase from '../ServiceBase';
import Artist from '../../Models/Artist';
import Track from '../../Models/Track';
import { Lyric } from '../../Models/Lyric';
import MediaItemSource from '../../Models/MediaItemSource';
import MediaItemType from '../../Models/MediaItemType';
import * as cheerio from 'cheerio';
import * as _ from 'underscore';
import 'backbonefire';
import { IndexedObject } from '../../Interfaces/Indexable';
import Query from '../../Models/Query';

/** 
 * This class is responsible for fetching data from the Genius API
 */
class GeniusService extends ServiceBase {
	access_token: string;
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
		var randomIndex = Math.floor(Math.random() * settings.access_tokens.length);
		this.access_token = settings.access_tokens[randomIndex];
		console.log('Using access_token ', this.access_token);
	}

	/**
	 * Main method for obtaining results from the service provider's API.
	 * @param {object} query - search term
	 *
	 * @return {promise} - Promise that when resolved returns the results of the data fetch, or an error upon rejection.
	 */
	public fetchData (query: Query): Promise<IndexedObject[]> {
		return new Promise<IndexedObject[]>((resolve, reject) => {

			let results: IndexedObject[] = [];
			this.rest.get(`${settings.base_url}/search`, {
				query: {
					q: query,
					access_token: this.access_token
				}
			}).on('success', data => {
				/* check response code */
				if (data.meta.status !== 200) {
					reject('Invalid return status');
				}

				var promises = [];

				for (var result of _.first(data.response.hits, 5)) {
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
		return new Promise<IndexedObject[]>( (resolve, reject) => {
			let results: IndexedObject[] = [];
			var promises = [];

			for (var trackId of trackIds) {
				// Add all songs to songs list
				promises.push(this.getData(trackId));
			}

			Promise.all(promises).then( (categorizedData) => {
				let geniusServiceResults = <GeniusServiceResult[]>categorizedData;

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
					console.error(err.stack);
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
					console.log('There are no referents');
					resolve([]);
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
				console.error(err.stack);
				reject(err);
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
					if (!_.isUndefined(annotation) && annotation.genius_id === lyric.annotation_id) {
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
			promises.push(<Promise<Lyric>>Lyric.fromType(MediaItemSource.Genius, MediaItemType.lyric, lyricData.genius_id));
		}

		return Promise.all(promises).then(models => {

			for (var i = 0, len = models.length; i < len; i++) {
				let model = models[i]
				let text = this.cleanUpLine(lyricsData[i].text);
				lyricsData[i].text = text;
				model.set(lyricsData[i]);
				model.save();
			}
			return models;
		});
	}

	private cleanUpLine(text: string): string {
		let removeVerseHeadersRegEx = /\[.*]|{.*}|\*.*\*/g;
		return text
			.replace(/\n/, '')
			.replace(removeVerseHeadersRegEx, '')
			.trim()
			.replace(/^.\s/, '');
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
		var resultSet: GeniusLyricData[] = [];
		let removeVerseHeadersRegEx = /\[.*]|{.*}|\*.*\*/g;

		/* If lyric starts with bracket then its just a verse indicator, don't ingest */
		var filteredLyrics = _.filter(lyricsData, item => {
			let text = item.text;
			return !(text.length === 0 || text === '\n' || text.match(removeVerseHeadersRegEx));
		});

		var aggregatedLyric = filteredLyrics[0];
		aggregatedLyric.text = this.cleanUpLine(aggregatedLyric.text);

		let characterCount = 50;

		for (var i = 0, len = filteredLyrics.length; i < len; i++) {
			let lyric = filteredLyrics[i];
			let text = this.cleanUpLine(lyric.text);

			if (aggregatedLyric.text === lyric.text) {
				continue;
			}

			let aggregatedLyricText = aggregatedLyric.text.trim();
			let aggregatedText = aggregatedLyricText === '' ? text : aggregatedLyricText + '. ' + text;

			if (aggregatedText.length >= characterCount) {
				aggregatedLyric.text = aggregatedText;
				resultSet.push(aggregatedLyric);
				aggregatedLyric = filteredLyrics[i + 1];
				if (aggregatedLyric) {
					aggregatedLyric.text = this.cleanUpLine(aggregatedLyric.text);
				}
			} else {
				aggregatedLyric.text = aggregatedText;
			}

			// if the last lyric hasn't been added, add it
			if (i === len - 1) {
				let lastText: string = this.cleanUpLine(filteredLyrics[i].text);
				if (aggregatedLyric && lastText !== ''  && aggregatedLyric.text.indexOf(lastText) === -1) {
					resultSet.push(filteredLyrics[i]);
				}
			}
		}
		return resultSet;
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
				let elements = $('.lyrics').toArray();
				if (elements.length) {
					try {
						let filteredElements = this.traverseTree(elements[0]);
						filteredElements = this.cleanUpLyrics(filteredElements);
						filteredElements = _.compact(filteredElements);
						for (var i = 0, len = filteredElements.length; i < len; i++) {
							filteredElements[i].genius_id = `${trackId}_${i}`;
							filteredElements[i].index = i;
						}
						filteredElements = _.uniq(filteredElements, a => a.text);
						resolve(filteredElements);
					} catch (err: Error) {
						console.error(err.stack);
						throw err;
					}
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
					lyrics = lyrics.concat([lyricData]);
					break;
				case 'tag':
					if (el.children.length) {
						lyrics = lyrics.concat(this.traverseTree(el));
					}
					break;
			}
		}

		return lyrics;
	}
}

export default GeniusService;
