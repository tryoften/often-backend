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
	ingestPopularTracks (): Promise<TrackId[]> {
		return new Promise<TrackId[]>( (resolve, reject) => {
			this.getPopularArtists().then( artistUrls => {
				var popularTrackPromises: Promise<TrackId[]>[] = [];
				for (let url of artistUrls) {
					popularTrackPromises.push(this.getPopularTracksForArtist(url));
				}
				return Promise.all(popularTrackPromises);
			}).then( popularTracks => {
				resolve(_.flatten(popularTracks));
			});
		});
	}

	/**
	 *
	 * @returns {Promise<ArtistURL[]>} - Returns a promise that resolves to an array of artist urls
     */
	getPopularArtists (): Promise<ArtistURL[]> {
		return new Promise<ArtistURL[]>( (resolve, reject) => {
			var artistResultPromises: Promise<ArtistURL[]>[] = [];

			for (let currentCode = 'a'.charCodeAt(0); currentCode <= 'z'.charCodeAt(0); currentCode++) {
				var index = String.fromCharCode(currentCode);
				artistResultPromises.push(this.getPopularArtistsForIndex(index));
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
	getPopularArtistsForIndex (index: string): Promise<ArtistURL[]> {
		return new Promise<ArtistURL[]>((resolve, reject) => {
			this.rest.get(`${this.geniusRoot}/artists-index/${index}`)
				.on('success', data => {
					var results = []
					let $ = cheerio.load(data);
					$('a.artists_index_list-artist_name').each(function() {
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
	 *
	 * @param artistUrl {ArtistURL} - url of an artist containing popular tracks for the artist
	 * @returns {Promise<TrackId[]>} - Returns a promise that resolves to an array of track ids
     */
	getPopularTracksForArtist (artistUrl: ArtistURL): Promise<TrackId[]> {
		return new Promise<TrackId[]>((resolve, reject) => {
			this.rest.get(artistUrl)
				.on('success', data => {
					var results = []
					let $ = cheerio.load(data);
					var songList = $('.song_list').get(0);
					$(songList).children().each(function() {
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

export default PreIngestor;
