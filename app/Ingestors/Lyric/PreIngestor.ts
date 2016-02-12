import { Service as RestService } from 'restler';
import * as cheerio from 'cheerio';
import * as _ from 'underscore';

type ArtistURL = string;
type TrackId = string;

class PreIngestor {
	rest: any;
	geniusRoot: string;

	constructor (urlRoot = 'http://genius.com') {
		this.geniusRoot = urlRoot;
		this.rest = new RestService({
			baseURL: this.geniusRoot
		});
	}

	/**
	 *
	 * @returns {Promise<TrackId[]>} - Returns a promise that resolves to an array of track ids
     */
	ingestTracks (popularArtistsOnly = true, popularTracksOnly = true): Promise<TrackId[]> {
		return new Promise<TrackId[]>( (resolve, reject) => {
			this.getArtists(popularArtistsOnly).then( artistUrls => {
				console.log(artistUrls);
				var trackPromises: Promise<TrackId[]>[] = [];

				return artistUrls.reduce( (prev, curr) => {

					return prev.then(() => {
						console.log(curr);
						console.log('running one');
						return this.getTracksForArtist(curr, popularTracksOnly);
					});
					//console.log('running one');
					//return this.getTracksForArtist(prev, popularTracksOnly).then(this.getTracksForArtist(curr, popularTracksOnly));
				}, Promise.resolve());
/*
				for (let url of artistUrls) {
					trackPromises.push(this.getTracksForArtist(url, popularTracksOnly));
				}
				return Promise.all(trackPromises);
				*/
			}).then( popularTracks => {
				console.log('bout to flatten');
				resolve(_.flatten(popularTracks));
			});
		});
	}

	getPopularTracksForArtist (artistUrl: ArtistURL) {
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

	getTracksForArtist (artistUrl: ArtistURL, popularTracksOnly = true) {
		return popularTracksOnly ? this.getPopularTracksForArtist(artistUrl) : this.parseInitialTrackPage(artistUrl);
	}

	parseInitialTrackPage (artistUrl: ArtistURL) {
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

	parseTrackPage (trackIds: string[], artistNum: string, artistId: string, pageNum = 1) {
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

	getTrackIds (trackIds: string[], artistNum: string, artistId: string, pageNum: number): Promise<TrackId[]> {
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





	/**
	 *
	 * @returns {Promise<ArtistURL[]>} - Returns a promise that resolves to an array of artist urls
     */
	getArtists (popularArtistsOnly = true): Promise<ArtistURL[]> {
		return new Promise<ArtistURL[]>( (resolve, reject) => {
			var artistResultPromises: Promise<ArtistURL[]>[] = [];

			for (let currentCode = 'a'.charCodeAt(0); currentCode <= 'z'.charCodeAt(0); currentCode++) {
				var index = String.fromCharCode(currentCode);
				artistResultPromises.push(this.getArtistsForIndex(index, popularArtistsOnly));
			}

			Promise.all(artistResultPromises).then(results => {
				resolve(_.flatten(results));
			}).catch( err => {
				console.log('Error fetching artist results:  ', err);
				reject(err);
			});

		});
	}

	/**
	 *
	 * @param index {string} - character (a to z) indicating letter index from popular artists should be fetched
	 * @returns {Promise<ArtistURL[]>} - Returns a promise that resolves to an array of artist Urls
     */
	getArtistsForIndex (index: string, popularArtistsOnly = true): Promise<ArtistURL[]> {
		return popularArtistsOnly ? this.getPopularArtistsForIndex(index) : this.parseArtistPage(index);
	}

	parseArtistPage (currentIndex, currentPage = 1, artistArr = []) {
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




	getArtistsPage (index, page) {
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
					var firstList = $('.artists_index_list').get(0)
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

	getPopularArtistsForIndex (index: string) {
		return new Promise<ArtistURL[]>((resolve, reject) => {
			var url = `${this.geniusRoot}/artists-index/${index}`;
			this.rest.get(url)
				.on('success', data => {
					var results = []
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

export default PreIngestor;
