import { Task } from '../../Workers/Worker';
import IngestionAdapter  from './IngestionAdapter';
import GeniusService from '../../Services/Genius/GeniusService';
import * as _ from 'underscore';
import Search from '../../Search/Search';
import MediaItemType from '../../Models/MediaItemType';
import logger from '../../logger';
import { IngestionTask, DestinationType, ArtistUrl, ArtistIndex, ArtistId, TrackId, InputFormat } from '../../Workers/IngestionWorker';
import { Service as RestService } from 'restler';
import * as cheerio from 'cheerio';
import {GeniusServiceResult} from '../../Services/Genius/GeniusDataTypes';
import {IndexableObject} from '../../Interfaces/Indexable';
import ImageResizerWorker from '../../Workers/ImageResizerWorker';
import MediaItem from '../../Models/MediaItem';
import { IngestionOption } from '../../Workers/IngestionWorker';
import TrendingIngestor from '../../Ingestors/Trending/TrendingIngestor';

interface GeniusServiceIngestionRequest extends Task {
	ids: string[];
	type: MediaItemType;
}

type Url = string;

class GeniusServiceIngestionAdapter extends IngestionAdapter {
	genius: GeniusService;
	search: Search;
	geniusRoot: string;
	rest: RestService;
	imageResizerWorker: ImageResizerWorker;
	trendingIngestor: TrendingIngestor;

	constructor (opts = {}) {
		super(opts);
		this.search = new Search();
		this.geniusRoot = 'http://genius.com';
		this.rest = new RestService({
			baseURL: this.geniusRoot
		});
		this.imageResizerWorker = new ImageResizerWorker();
		this.genius = new GeniusService({provider_id: 'genius'});
		this.trendingIngestor = new TrendingIngestor();
	}

	/**
	 * Main method for processing Ingestion worker's requests
	 *
	 * @param {IngestionTask} task - Object specifying the type of ingestion that is to be performed
	 * @param {Function} progress - Firebase function for keeping track of task's progress
	 * @param {Function} resolve - Firebase function for accepting ingestion results
	 * @param {Function} reject - Firebase function for declining ingestion results that are deemed unacceptable
	 */
	public process (task: IngestionTask, progress: any, resolve: any, reject: any) {
		var destinations = task.destinations;
		if (!_.contains(destinations, DestinationType.Firebase)) {
			logger.warn('Option to not persist to firebase ignored');
		}

		let getTracksPromise: Promise<TrackId[]>;

		/* Choose a type of ingestion:
		(1) Trending artists/tracks/lyrics only or
		(2) Media items related to caller supplied conditional criteria */
		getTracksPromise = (task.ingestionOption === IngestionOption.Trending) ?
			this.trendingIngestor.getTrendingTrackIds() :
			this.getTrackIdsForTask(task);

		var mediaItems = [];

		var doneImageResizing = getTracksPromise.then( (trackIds: TrackId[]) => {
			logger.info('Fetched the following track ids for processing: ', JSON.stringify(trackIds));
			return this.genius.trackIdsToGeniusServiceResults(<string[]>trackIds);
		}).then( (geniusServiceResults: GeniusServiceResult[]) => {

			/* This section is reserved for image resizing */
			logger.info('Successfully generated genius service results...');
			var imagePromises = [];

			for (let gsr of geniusServiceResults) {

				/* Keep track of all media items for later references */
				mediaItems.push(gsr.artist);
				mediaItems.push(gsr.track);
				for (let lyr of gsr.lyrics) {
					mediaItems.push(lyr);
				}

				/* Queue up media items for image resizing */
				imagePromises.push(this.imageResizerWorker.resizeMediaItem(gsr.track));
				imagePromises.push(this.imageResizerWorker.resizeMediaItem(gsr.artist));


			}

			return Promise.all(imagePromises);

		});

		doneImageResizing.then( () => {

			/* Resync all media items with Firebase to ensure that the backbone models have updated images */
			logger.info('About to re-sync all media items with Firebase...');
			var updateMediaItemPromises = [];
			for (let mi of mediaItems) {
				updateMediaItemPromises.push(mi.syncData());
			}

			return Promise.all(updateMediaItemPromises);
		}).then((updatedMediaItems) => {

			/* This portion of the promise chain is reserved for trending updates */
			if (task.ingestionOption === IngestionOption.Trending) {
				logger.info('About to update trending collection in Firebase...');
				return this.trendingIngestor.updateTrendingWithMediaItems(updatedMediaItems);

			} else {
				logger.info('Processed media items are NOT trending. Resolving mediat items...');
				return Promise.resolve(updatedMediaItems);
			}

		}).then( (updatedMediaItems: MediaItem[]) => {

			/* This portion of the promise chain is reserved for updating ElasticSearch results */
			var indexableMediaItems: IndexableObject[] = [];

			for (var item of updatedMediaItems) {
				indexableMediaItems.push(item.toIndexingFormat());
			}
			if (!_.contains(destinations, DestinationType.ElasticSearch)) {
				logger.warn('NOT persisting to ElasticSearch. Add ElasticSearch to destinations field for persistence');
				return Promise.resolve(updatedMediaItems);
			}

			return this.search.index(indexableMediaItems);

		}).then( indexed => {

			/* Final section of the promise chain. Acts as a finalizer to inform the ingestion worker that ingestion is done */
			resolve(indexed);

		}).catch( (err: Error) => {
			logger.error(err.stack);
			reject(err);
		});


	}


	/**
	 * Fetches track ids based on artist index ('a' to 'z') and artist & track popularity criteria
	 *
	 * @param {ArtistIndex} artistIndex - Object containing index and popularity criteria
	 * @returns {Promise<TrackId[]>} - Returns a promise that resolves to an array of track ids, or an error upon rejection
	 */
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


	/**
	 * A wrapper for retrieving track ids with artist url(s)
	 *
	 * @param {ArtistUrl | ArtistUrl[]} artistUrls - An object or an array of ArtistUrl objects
	 * 		containing urls of artists whose tracks are to be ingested
	 * @returns {Promise<TrackId[]>} - Returns a promise that resolves to an array of TrackIds, or an error upon rejection
	 */
	private fetchTracksWithArtistUrl (artistUrls: ArtistUrl | ArtistUrl[] ): Promise<TrackId[]> {

		if (!_.isArray(artistUrls)) {
			artistUrls = <ArtistUrl[]> [artistUrls];
		}

		return this.getTrackIdsForArtistUrls(<ArtistUrl[]>artistUrls);

	}


	/**
	 * Retrieves track ids with artist id(s)
	 *
	 * @param {ArtistId | ArtistId[]} artistIds - An object or an array of ArtistId objects
	 * 		containing ids of artists whose tracks are to be ingested
	 * @returns {Promise<TrackId[]>} - Returns a promise that resolves to an array of TrackIds, or an error upon rejection
	 */
	private fetchTracksWithArtistId(artistIds: ArtistId | ArtistId[]): Promise<TrackId[]> {
		// TODO(general): Implement this method for future use
		throw new Error('fetchTracksWithArtistId not implemented (yet)');
	}

	private fetchTracksWithTrackId(trackIds: TrackId | TrackId[]): Promise<TrackId[]> {
		if (!_.isArray(trackIds)) {
			trackIds = <TrackId[]> [trackIds];
		}
		return Promise.resolve(trackIds);
	}


	/**
	 * Retrieves track ids with IngestionTask
	 *
	 * @param {IngestionTask} task - Task describing the type and format of input data to be processed for ingestion
	 * @returns {Promise<TrackId[]>} - Returns a promise that resolves to an array of TrackIds, or an error upon rejection
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

						/* Naive case: All track id(s) already supplied */
						return this.fetchTracksWithTrackId(<TrackId | TrackId[]> task.data);

					default:
						throw new Error('Invalid format type for track ingestion request. Permitted values are Id');
				}
				break;
			default:
				throw new Error('Invalid task supplied.');
		}
	}

	/**
	 * Checks whether a passed in letter belongs to an alphabetical range from a to z
	 *
	 * @param {string} letter - string containing a letterfrom a to z
	 * @returns {boolean} - Boolean indicating whether the letter is an alphabetical range or not
	 */
	private isValidLetter (letter: string): boolean {
		if (letter.length !== 1) {
			throw new Error('Not a letter');
		}
		var lowercaseLetter = letter.toLocaleLowerCase();

		return  /^[\x61-\x7A]*$/.test(lowercaseLetter);

	}


	/**
	 * Retrieves track ids with artist url(s) by processing artist urls in sequential order
	 *
	 * @param {ArtistUrl[]} artistUrls - An array of ArtistUrl objects
	 * 		containing urls of artists whose tracks are to be ingested
	 * @returns {Promise<TrackId[]>} - Returns a promise that resolves to an array of TrackIds, or an error upon rejection
	 */
	private getTrackIdsForArtistUrls (artistUrls: ArtistUrl[]): Promise<TrackId[]> {

		var tracks = [];
		var getTracksInSequence = artistUrls.reduce( (prev, curr: ArtistUrl) => {

			return prev.then((newTracks) => {
				tracks = tracks.concat(newTracks);
				return this.getTracksForArtist(curr.url, curr.popularTracksOnly);
			});
		}, Promise.resolve([]));

		return new Promise((resolve, reject) => {
			getTracksInSequence.then( (newTracks) => {
				tracks = tracks.concat(newTracks);
				resolve(_.flatten(tracks));
			}).catch( err => {
				reject(err);
			});
		});

	}

	/**
	 * Retrieves an array of artist urls for a given index and artist popularity flag
	 *
	 * @param {string} index - character (a to z) indicating letter index from popular artists should be fetched
	 * @param {boolean} popularArtistsOnly - flag indicating whether to retrieve only popular artists from index page (defaults to true)
	 * @returns {Promise<ArtistURL[]>} - Returns a promise that resolves to an array of artist Urls, or an error upon rejection
	 */
	private getArtistsForIndex (index: string, popularArtistsOnly = true): Promise<Url[]> {
		return popularArtistsOnly ? this.getPopularArtistsForIndex(index) : this.getAllArtistsForIndex(index);
	}

	/**
	 * Retrieves an array of TrackIds for a given artist url and track popularity flag
	 *
	 * @param {boolean} popularTracksOnly - flag indicating whether to retrieve only popular tracks from artist page (defaults to true)
	 * @returns {Promise<ArtistURL[]>} - Returns a promise that resolves to an array of track ids, or an error upon rejection
	 */
	private getTracksForArtist (artistUrl: Url, popularTracksOnly = true): Promise<TrackId[]> {
		return popularTracksOnly ? this.getPopularTracksForArtist(artistUrl) : this.getAllTracksForArtist(artistUrl);
	}


	/**
	 * Retrieves an array of all tracks for a given artist
	 * @param {Url} artistUrl - Url of an artist whose tracks are to be retrieved
	 * @returns {Promise<T>} - Returns a promise that resolves to an array of track ids, or an error upon rejection
	 */
	private getAllTracksForArtist (artistUrl: Url): Promise<TrackId> {
		return new Promise<TrackId>( (resolve, reject) => {
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
				logger.error('Failed to get popular tracks for artist: ', err);
				reject(err);
			});
		});
	}

	/**
	 * TODO(jakub): Fill in remaining parameters and test
	 * Recursively parses track pages
	 *
	 * @param {TrackId[]} trackIds - Array of track ids to be populated through recursive parsing of pages (defaults to [])
	 * @param artistNum
	 * @param artistId
	 * @param pageNum - (defaults to 1)
	 * @returns {Promise<TrackId[]>} - Returns a promise that resolves to an array of track ids, or an error upon rejection
	 */
	private parseTrackPage (trackIds: TrackId[], artistNum: string, artistId: string, pageNum = 1): Promise<TrackId[]> {
		return new Promise<TrackId[]>((resolve, reject) => {
			this.getTrackIds(trackIds, artistNum, artistId, pageNum)
				.then((tracks) => {

					if (tracks.length === 0) {
						resolve(trackIds);
					} else {
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


	/**
	 * Returns popular tracks for artist url
	 *
	 * @param {Url} artistUrl - Url of an artist
	 * @returns {Promise<TrackId[]>} - Returns a promise that resolves to an array of track ids, or an error upon rejection
	 */
	private getPopularTracksForArtist (artistUrl: Url): Promise<TrackId[]> {
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


	/**
	 * Recursively retries urls of all artists for a given index
	 *
	 * @param {string} currentIndex - specifies the index from 'a' to 'z' to be parsed
	 * @param {number} currentPage - specifies the page to be parsed (defaults to 1)
	 * @param {Url[]} artistArr - Array of artist urls to be populated through recursive parsing of pages (defaults to [])
	 * @returns {Promise<Url[]>} - Returns a promise that resolves to an array of artist urls, or an error upon rejection
	 */
	private getAllArtistsForIndex (currentIndex: string, currentPage = 1, artistArr = []): Promise<Url[]> {
		return new Promise<Url[]>((resolve, reject) => {
			this.getArtistsPage(currentIndex, currentPage)
				.then((artists) => {

					if (artists.length === 0) {
						resolve(artistArr);
					} else {
						console.log(artistArr.length);
						artistArr = artistArr.concat(artists);

						/* If page was processed properly then queue up the next one */
						resolve(this.getAllArtistsForIndex(currentIndex, currentPage + 1, artistArr));
					}

				})
				.catch((err) => {
					resolve(artistArr);
				});
		});
	}

	/**
	 * Retrieves all artist for a given index and page
	 *
	 * @param {string} index - character (a to z) indicating letter index from popular artists should be fetched
	 * @param {number} page - page number of an index page from which artist urls should be retrieved
	 * @returns {Promise<Url[]>} - Returns a promise that resolves to an array of artist urls, or an error upon rejection
	 */
	private getArtistsPage (index: string, page: number): Promise<Url[]> {
		return new Promise<Url[]>((resolve, reject) => {
			var url = `http://genius.com/artists-index/${index}/all`;
			logger.info(`Parsing page ${page} of index: ${index}`);
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
				}).on('error', (err: Error) => {
				logger.error(`Failed to get popular artists for index ${index} nad page ${page} `, err.stack);
				reject(err);
			});
		});
	}

	/**
	 * Returns urls of popular artists for a given index
	 *
	 * @param {string} index - character (a to z) indicating letter index
	 * @returns {Promise<Url[]>} - Returns a promise that resolves to an array of artist urls, or an error upon rejection
	 */
	private getPopularArtistsForIndex (index: string): Promise<Url[]> {
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


	/**
	 * TODO(jakub): Fill in remaining parameters and test
	 * Recursively fetches track ids by arsing artist pages
	 *
	 * @param {TrackId[]} trackIds - Array of track ids to be populated through recursive parsing of pages (defaults to [])
	 * @param artistNum
	 * @param artistId
	 * @param pageNum
	 * @returns {Promise<TrackId[]>} - Returns a promise that resolves to an array of track ids, or an error upon rejection
	 */
	private getTrackIds (trackIds: TrackId[], artistNum: string, artistId: string, pageNum: number): Promise<TrackId[]> {
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
				logger.error('Failed to get popular tracks for artist: ', err);
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
