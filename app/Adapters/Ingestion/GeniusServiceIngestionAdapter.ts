import { Task } from '../../Workers/Worker';
import IngestionAdapter  from './IngestionAdapter';
import { firebase as FirebaseConfig } from '../../config';
import GeniusService from '../../Services/Genius/GeniusService';
import * as _ from 'underscore';
import Search from '../../Search/Search';
import MediaItemType from '../../Models/MediaItemType';
import { IndexableObject } from '../../Interfaces/Indexable';
import logger from '../../logger';
import { IngestionTask, DestinationType, ArtistUrl, ArtistIndex, ArtistId, TrackId } from '../../Workers/IngestionWorker';
let fs = require('fs');


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

	constructor (opts = {}) {
		super(opts);
		this.search = new Search();
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
			logger.warn("Option to not persist ignored");
		}
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


	private getTrackIdsFromArtistIndex(artistIndex: ArtistIndex): Promise<TrackId> {

		if (!isValidLetter(artistIndex.index)) {
			throw new Error('Invalid artist index supplied. The index must be in an alphabetical range form a to z');
		}
		return new Promise( (resolve, reject) => {
			this.getArtistsForIndex(artistIndex.index, artistIndex.popularArtistsOnly).then( (relevantArtistUrls: Url[]) => {

				//TODO(jakub): Build on top of getTrackIdsFromArtistUrl
				//return this.getTrackIdsFromArtistUrls (relevantArtistUrls, artistIndex.popularTracksOnly);
			}).then((trackIds) => {
				resolve(trackIds);
			}).catch((err) => {
				reject(err);
			});
		});

	}


	private getTrackIdsFromArtistUrl (artistUrls: ArtistUrl | ArtistUrl[]): Promise<TrackId> {





		return this.getTrackIdsForArtistUrls (artistUrl, artistIndex.popularTracksOnly);

		getTracksForArtist (artistUrl: ArtistURL, popularTracksOnly = true) {
			return popularTracksOnly ? this.getPopularTracksForArtist(artistUrl) : this.parseInitialTrackPage(artistUrl);
		}

		getTrackIdsForUrls

		return null;
	}

	private getTrackIdsFromArtistId(artistId: ArtistId | ArtistId[]): Promise<TrackId> {
		// TODO(general): Implement this method
		throw new Error('getTrackIdsFromArtistId not implemented (yet)');
	}



	/**
	 *
	 *
	 * @param {Ingestion Task} task - Task describing the type and format of input data to be ingested
	 * @returns {null}
	 */
	private getTrackIds (task: IngestionTask): Promise<TrackId[]> {
		switch (task.type) {
			case MediaItemType.artist:
				switch (task.format) {
					case InputFormat.Url:
						return this.getTrackIdsFromArtistUrl(task.data);
						break;
					case InputFormat.Index:
						return this.getTrackIdsFromArtistIndex(task.data);
						break;
					case InputFormat.Id:
						return this.getTrackIdsFromArtistId(task.data);
						break;
					default:
						throw new Error('Invalid format type for artist ingestion request. Permitted values are Url, Index, Id');
				}
				break;
			case MediaItemType.track:
				switch (task.format) {
					case InputFormat.Id:
						// Naive case: All track id(s) already supplied
						return Promise.resolve(task.data);
						break;
					default:
						throw new Error('Invalid format type for track ingestion request. Permitted values are Id');
				}
			default:
				throw new Error('Invalid task supplied.');
		}
	}

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



	private indexToES (indexables: IndexableObject[]) {
		return this.search.index(indexables);
	}



	// 	_    _      _
	// | |  | |    | |
	// | |__| | ___| |_ __   ___ _ __ ___
	// |  __  |/ _ \ | '_ \ / _ \ '__/ __|
	// | |  | |  __/ | |_) |  __/ |  \__ \
	// |_|  |_|\___|_| .__/ \___|_|  |___/
	// 				 | |
	// 				 |_|


	private getTrackIdsForArtistUrls (artistUrls: AristUrl[], popularTracksOnly: boolean): Promise<TrackId[]> {

		var getTracksInSequence = artistUrls.reduce( (prev, curr) => {

			return prev.then(() => {
				console.log(curr);
				console.log('running one');
				return this.getTracksForArtist(curr, popularTracksOnly);
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
	private getArtistsForIndex (index: string, popularArtistsOnly = true): Promise<ArtistURL[]> {
		return popularArtistsOnly ? this.getPopularArtistsForIndex(index) : this.parseArtistPage(index);
	}

	private getTracksForArtist (artistUrl: ArtistURL, popularTracksOnly = true): Promise<TrackId[]> {
		return popularTracksOnly ? this.getPopularTracksForArtist(artistUrl) : this.parseInitialTrackPage(artistUrl);
	}

	private parseInitialTrackPage (artistUrl: ArtistURL) {
		return new Promise( (resolve, reject) => {
			this.rest.get(artistUrl)
				.on('success', data => {

					let $ = cheerio.load(data);
					var artistInfo = $('.edit_artist').get(0);
					var artistIdUnsanitized = $(artistInfo).attr('id');
					var artistParts = artistIdUnsanitized.split('_');
					var artistNum = artistParts[artistParts.length -1];

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

	private getPopularTracksForArtist (artistUrl: ArtistURL): Promise<TrackId[]> {
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
		return new Promise<ArtistURL[]>((resolve, reject) => {
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

	private getPopularArtistsForIndex (index: string): Promise<ArtistUrl[]> {
		return new Promise<ArtistUrl[]>((resolve, reject) => {
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
