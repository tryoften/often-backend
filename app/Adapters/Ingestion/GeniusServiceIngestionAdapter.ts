import { Task } from '../../Workers/Worker';
import IngestionAdapter  from './IngestionAdapter';
import GeniusService from '../../Services/Genius/GeniusService';
import * as _ from 'underscore';
import Search from '../../Search/Search';
import MediaItemType from '../../Models/MediaItemType';
import logger from '../../logger';
import { IngestionTask, DestinationType, ArtistUrl, ArtistIndex, ArtistId, TrackId, InputFormat } from '../../Workers/IngestionWorker';
//let fs = require('fs');
import { Service as RestService } from 'restler';


interface GeniusServiceIngestionRequest extends Task {
	ids: string[];
	type: MediaItemType;
	targets: IngestionTarget[];
}

interface IngestionTarget {
//	type: IngestionTargetType;
	data: any;
}

type Url = string;

class GeniusServiceIngestionAdapter extends IngestionAdapter {
	genius: GeniusService;
	search: Search;
	geniusRoot: string;
	rest: any;

	constructor (opts = {}) {
		super(opts);
		this.search = new Search();
		this.geniusRoot = 'http://genius.com';
		this.rest = new RestService({
			baseURL: this.geniusRoot
		});
	}




	// 	__  __       _         __  __      _   _               _
	// |  \/  |     (_)       |  \/  |    | | | |             | |
	// | \  / | __ _ _ _ __   | \  / | ___| |_| |__   ___   __| |___
	// | |\/| |/ _` | | '_ \  | |\/| |/ _ \ __| '_ \ / _ \ / _` / __|
	// | |  | | (_| | | | | | | |  | |  __/ |_| | | | (_) | (_| \__ \
	// |_|  |_|\__,_|_|_| |_| |_|  |_|\___|\__|_| |_|\___/ \__,_|___/

	public process (task: IngestionTask, progress: any, resolve: any, reject: any) {

		var destinations = task.destinations;
		if (!_.contains(destinations, DestinationType.Firebase)) {
			logger.warn('Option to not persist ignored');
		}

		this.getTrackIdsForTask(task).then( (trackIds: TrackId[]) => {
			return this.genius.trackIdsToIndexableObjects(<string[]>trackIds);
		}).then( indexableTrackIds => {
			if (!_.contains(destinations, DestinationType.ElasticSearch)) {
				logger.warn(`Results for ${task} NOT being indexed in ElasticSearch`);
				return Promise.resolve(true);
			} else {
				logger.info(`Results for ${task} are being indexed in ElasticSearch`);
				return this.search.index(indexableTrackIds);
			}
		}).then( done => {
			resolve(done);
		}).catch( err => {
			reject(err);
		});

/*
		this.getGeniusData().then( (indexables: IndexableObject[]) => {
			if (_.contains(destinations, DestinationType.ElasticSearch)) {
				logger.info('Indexing results of task in ElasticSearch', JSON.stringify(task));
				return this.indexToES(indexables);
			} else {
				return Promise.resolve(true);
			}
		}).then(() => {
			logger.info('Task successfully processed', JSON.stringify(task));
			resolve(true);
		}).catch(err => {
			logger.error('Error caught in Genius Service Ingestion Adapter', err.stack);
			reject(JSON.stringify(err));
		})
*/

	}


	private fetchTracksWithArtistIndex(artistIndex: ArtistIndex): Promise<TrackId[]> {

		if (!this.isValidLetter(artistIndex.index)) {
			throw new Error('Invalid artist index supplied. The index must be in an alphabetical range form a to z');
		}
		return new Promise( (resolve, reject) => {
			this.getArtistsForIndex(artistIndex.index, artistIndex.popularArtistsOnly).then( (relevantArtistUrls: Url[]) => {
				var artistUrlObjs: ArtistUrl[] = [];
				for (var url of relevantArtistUrls) {
					artistUrlObjs.push({
						url: url,
						popularTracksOnly: artistIndex.popularTracksOnly
					});
				}
				return this.fetchTracksWithArtistUrl(artistUrlObjs);
			}).then( (trackIds) => {
				resolve(trackIds);
			}).catch( (err) => {
				reject(err);
			});
		});

	}


	private fetchTracksWithArtistUrl (artistUrls: ArtistUrl | ArtistUrl[] ): Promise<TrackId[]> {

		if (!_.isArray(artistUrls)) {
			artistUrls = <ArtistUrl[]> [artistUrls];
		}

		return this.getTrackIdsForArtistUrls(<ArtistUrl[]>artistUrls);

	}

	private fetchTracksWithArtistId(artistId: ArtistId | ArtistId[]): Promise<TrackId[]> {
		// TODO(general): Implement this method
		throw new Error('fetchTracksWithArtistId not implemented (yet)');
	}

	private fetchTracksWithTrackId(trackIds: TrackId | TrackId[]): Promise<TrackId[]> {
		// TODO(general): Implement this method
		if (!_.isArray(trackIds)) {
			trackIds = <TrackId[]> [trackIds];
		}
		return Promise.resolve(trackIds);
	}



	/**
	 *
	 *
	 * @param {Ingestion Task} task - Task describing the type and format of input data to be ingested
	 * @returns {null}
	 */
	private getTrackIdsForTask (task: IngestionTask): Promise<TrackId[]> {
		switch (task.type) {
			case MediaItemType.artist:
				switch (task.format) {
					case InputFormat.Url:
						return this.fetchTracksWithArtistUrl(<ArtistUrl | ArtistUrl[]>task.data);

					case InputFormat.Index:
						return this.fetchTracksWithArtistIndex(<ArtistIndex>task.data);

					case InputFormat.Id:
						return this.fetchTracksWithArtistId(<ArtistId | ArtistId[]>task.data);

					default:
						throw new Error('Invalid format type for artist ingestion request. Permitted values are Url, Index, Id');
				}
				break;
			case MediaItemType.track:
				switch (task.format) {
					case InputFormat.Id:
						// Naive case: All track id(s) already supplied
						return this.fetchTracksWithTrackId(<TrackId | TrackId[]> task.data);

					default:
						throw new Error('Invalid format type for track ingestion request. Permitted values are Id');
				}
				break;
			default:
				throw new Error('Invalid task supplied.');
		}
	}


	// 	_    _      _
	// | |  | |    | |
	// | |__| | ___| |_ __   ___ _ __ ___
	// |  __  |/ _ \ | '_ \ / _ \ '__/ __|
	// | |  | |  __/ | |_) |  __/ |  \__ \
	// |_|  |_|\___|_| .__/ \___|_|  |___/
	// 				 | |
	// 				 |_|


	/**
	 * Checks whether a passed in letter belongs to an alphabetical range from a to z
	 *
	 * @param {string} letter - string containing a letter
	 * @returns {boolean} - Boolean indicating whether the letter is an alphabetical range or not
	 */
	private isValidLetter (letter: string): boolean {
		if (letter.length !== 1) {
			throw new Error('Not a letter');
		}
		var lowercaseLetter = letter.toLocaleLowerCase();

		return  /^[\x61-\x7A]*$/.test(lowercaseLetter);

	}



	private getTrackIdsForArtistUrls (artistUrls: ArtistUrl[]): Promise<TrackId[]> {

		// Fetch popular tracks only from each artistUrl object

		var getTracksInSequence = artistUrls.reduce( (prev, curr: ArtistUrl) => {

			return prev.then(() => {
				return this.getTracksForArtist(curr.url, curr.popularTracksOnly);
			});
		}, Promise.resolve());

		return new Promise((resolve, reject) => {
			getTracksInSequence.then( (tracks) => {
				resolve(_.flatten(tracks));
			}).catch( err => {
				reject(err);
			});
		});

	}




	/**
	 *
	 * @param index {string} - character (a to z) indicating letter index from popular artists should be fetched
	 * @returns {Promise<ArtistURL[]>} - Returns a promise that resolves to an array of artist Urls
	 */
	private getArtistsForIndex (index: string, popularArtistsOnly = true): Promise<string[]> {
		return popularArtistsOnly ? this.getPopularArtistsForIndex(index) : this.parseArtistPage(index);
	}

	private getTracksForArtist (artistUrl: string, popularTracksOnly = true): Promise<TrackId[]> {
		return popularTracksOnly ? this.getPopularTracksForArtist(artistUrl) : this.parseInitialTrackPage(artistUrl);
	}

	private parseInitialTrackPage (artistUrl: string) {
		return new Promise( (resolve, reject) => {
			this.rest.get(artistUrl)
				.on('success', data => {

					let $ = cheerio.load(data);
					var artistInfo = $('.edit_artist').get(0);
					var artistIdUnsanitized = $(artistInfo).attr('id');
					var artistParts = artistIdUnsanitized.split('_');
					var artistNum = artistParts[artistParts.length - 1];

					var trackIds = [];
					var songList = $('.song_list').get(0);
					$(songList).children().each(function () {
						trackIds.push($(this).attr('data-id'));
					});
					var splitUrl = artistUrl.split('/');
					var artistId = splitUrl[splitUrl.length - 1];

					resolve(this.parseTrackPage(trackIds, artistNum, artistId));
				}).on('error', err => {
				console.log('Failed to get popular tracks for artist: ', err);
				reject(err);
			});
		});
	}

	private parseTrackPage (trackIds: string[], artistNum: string, artistId: string, pageNum = 1) {
		return new Promise ((resolve, reject) => {
			this.getTrackIds(trackIds, artistNum, artistId, pageNum)
				.then((tracks) => {

					if (tracks.length === 0) {
						console.log('track length is 0');
						resolve(trackIds);
					} else {
						console.log(trackIds.length);
						trackIds = trackIds.concat(tracks);
						/* If page was processed properly then queue up the next one */
						resolve(this.parseTrackPage(trackIds, artistNum, artistId, pageNum + 1));
					}

				})
				.catch((err) => {
					resolve(trackIds);
				});
		});
	}
	private getPopularTracksForArtist (artistUrl: string): Promise<TrackId[]> {
		return new Promise<TrackId[]>((resolve, reject) => {
			this.rest.get(artistUrl)
				.on('success', data => {
					var results = [];
					let $ = cheerio.load(data);
					var songList = $('.song_list').get(0);
					$(songList).children().each(function () {
						results.push($(this).attr('data-id'));
					});
					resolve(results);
				}).on('error', err => {
				console.log('Failed to get popular tracks for artist: ', err);
				reject(err);
			});
		});
	}


	private parseArtistPage (currentIndex, currentPage = 1, artistArr = []) {
		return new Promise((resolve, reject) => {
			this.getArtistsPage(currentIndex, currentPage)
				.then((artists) => {

					if (artists.length === 0) {
						console.log('length is 0');
						resolve(artistArr);
					} else {
						console.log(artistArr.length);
						artistArr = artistArr.concat(artists);
						/* If page was processed properly then queue up the next one */
						resolve(this.parseArtistPage(currentIndex, currentPage + 1, artistArr));
					}

				})
				.catch((err) => {
					resolve(artistArr);
				});
		});
	}

	private getArtistsPage (index, page) {
		return new Promise<string[]>((resolve, reject) => {
			var url = `http://genius.com/artists-index/${index}/all`;
			console.log('processing page', url, page);
			this.rest.get(url, {
					query: {
						page: page
					}
				})
				.on('success', data => {
					var results = [];
					let $ = cheerio.load(data);
					var firstList = $('.artists_index_list').get(0);
					$('a', firstList).each(function (i, val) {
						results.push($(val).attr('href'));
					});

					resolve(results);
				}).on('error', err => {
				console.log('Failed to get popular artists for index: ', err);
				reject(err);
			});
		});
	}

	private getPopularArtistsForIndex (index: string): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			var url = `${this.geniusRoot}/artists-index/${index}`;
			this.rest.get(url)
				.on('success', data => {
					var results = [];
					let $ = cheerio.load(data);
					$('a.artists_index_list-artist_name').each(function () {
						results.push($(this).attr('href'));
					});
					resolve(results);
				}).on('error', err => {
				console.log('Failed to get popular artists for index: ', err);
				reject(err);
			});
		});
	}

	private getTrackIds (trackIds: string[], artistNum: string, artistId: string, pageNum: number): Promise<TrackId[]> {
		return new Promise( (resolve, reject) => {
			this.rest.get('http://genius.com/artists/songs', {
				query: {
					for_artist_page: artistNum,
					page: pageNum,
					id: artistId
				}
			}).on('success', data => {

				var results = [];
				let $ = cheerio.load(data);
				var songList = $('.song_list').get(0);
				$(songList).children().each(function () {
					results.push($(this).attr('data-id'));
				});
				resolve(results);
			}).on('error', err => {
				console.log('Failed to get popular tracks for artist: ', err);
				reject(err);
			});
		});
	}



}


export default GeniusServiceIngestionAdapter;

/*
process(data: GeniusServiceIngestionRequest, progress, resolve, reject)
{
	logger.info('GeniusServiceIngestionWorker.process(): owner-id: ', data._owner, ' ids: ', data.ids, ' type: ', data.type);

	var ids = data.ids;
	var type = data.type;
	var targets = data.targets;

	var MediaItemClass = MediaItemType.toClass(type);
	var promises = [];

	for (var id of ids) {
		var mediaItem = new MediaItemClass({id: id});
		promises.push(mediaItem.syncData());
	}

	Promise.all(promises).then(syncedMediaItems => {
		logger.info('GeniusServiceIngestionWorker.process(): owner-id: ', data._owner, ' ids: ', data.ids, ' event: Synced all data.');
		var indexables = [];
		for (var smi of syncedMediaItems) {
			var indexingFormat = smi.toIndexingFormat();
			indexables.push(indexingFormat);
		}
		return indexables;
	}).then(allIndexables => {

		let targetPromises = [];
		for (let target of targets) {
			switch (target.type) {
				case (IngestionTargetType.file):
					targetPromises.push(this.writeToFS(target.data, allIndexables, type));
					break;

				case (IngestionTargetType.elasticsearch):
					targetPromises.push(this.indexToES(allIndexables));
					break;

				default:
					reject(targetPromises);
					return;
			}
		}
		return Promise.all(targetPromises);

	}).then((results) => {
		logger.info('GeniusServiceIngestionWorker.process(): owner-id: ', data._owner,
			' ids: ', data.ids, ' type: ', data.type, ' results: ', results);
		resolve(results);
	}).catch(err => {
		logger.error('GeniusServiceIngestionWorker.process(): owner-id: ', data._owner,
			' ids: ', data.ids, ' type: ', data.type, ' error: ', err);
		reject(err);
	});
}

indexToES(indexables: IndexableObject[]){
	return this.search.index(indexables);
}

writeToFS(dir: string, indexables: IndexableObject[], type:MediaItemType)
{

	return new Promise((resolve, reject) => {
		var writeString = '';
		for (var index of indexables) {
			var esFormat = this.search.getIndexFormat(index);
			writeString += JSON.stringify(esFormat[0]) + '\n' + JSON.stringify((esFormat[1])) + '\n';
		}

		var fileName = `${dir}/${type}-${Date.now()}`;
		fs.writeFile(fileName, writeString, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve(fileName);
			}
		});
	});
 }

*/
