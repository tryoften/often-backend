import 'backbonefire';
import ServiceBase from '../ServiceBase';
import { Settings as settings } from './config';

var spotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new spotifyWebApi();

/** 
 * This class is responsible for fetching data from the Spotify API
 */
class SpotifyService extends ServiceBase {
	
	/**
	 * Initializes the spotify service provider.
	 * @param {object} models - supporting models
	 *
	 * @return {void}
	 */
	constructor (models) {

		super(models, settings);

	}
	
	/**
	 * Main method for obtaining results from the service provider's API.
	 * @param {object} query - search term
	 *
	 * @return {promise} - Promise that when resolved returns the results of the data fetch, or an error upon rejection.
	 */
	fetchData (query) {

		return new Promise((resolve, reject) => {

			var results = {};
			this.getSpotifyData(query, results).then(function (data) {

				resolve(results);

			});

		});

	}

	/**
	 * Barrier method for collecting results from multiple service provider API calls.
	 * @param {string} query - search term
	 * @results {object} results - object for storing data from the service provider's
	 *
	 * @return {promise} - Returns a promise when all sub-promises are resolved or an error on rejection.
	 */
	getSpotifyData (query, results) {

		return Promise.all([

			this.searchArtists(query, results),
			this.searchAlbums(query, results),
			this.searchTracks(query, results),
			this.searchPlaylists(query, results)

		]);
		
	}

	/**
	 * Searches spotify playlists using query and populates the results object with playlist information.
	 * @param {string} query - search term
	 * @param {object} results - object for storing data from the service provider's
	 *
	 * @return {promise} - Returns a promise that resolves to either true if resolved or false, when rejected.
	 */
	searchPlaylists (query, results) {

		return new Promise(function (resolve, reject) {

			spotifyApi.searchPlaylists(query).then(function (data) {

				var playlistItems = data.body.playlists.items;
				var playlists = [];
				for (let pi in playlistItems) {

					playlists.push({
						playlist_name : playlistItems[pi].name
					});

				}
				results.playlists = playlists;
				resolve(true);

			}, function (error) {

				console.log('Error detected ' + error);
				reject(false);

			});

		});

	}
	
	/**
	 * Searches spotify tracks using query and populates the results object with track information.
	 * @param {string} query - search term
	 * @param {object} results - object for storing data from the service provider's
	 *
	 * @return {promise} - Returns a promise that resolves to either true if resolved or false, when rejected.
	 */
	searchTracks (query, results) {
		return new Promise(function (resolve, reject){

			spotifyApi.searchTracks(query).then(function (data) {

				var trackItems = data.body.tracks.items;
				var tracks = [];
				for(let ti in trackItems) {

					tracks.push({
						track_name : trackItems[ti].name,
						track_image_large : trackItems[ti].album.images[0].url
					});

				}
				results.tracks = tracks;
				resolve(true);

			}, function (error) {

				console.log('Error detected ' + error);
				reject(false);

			});

		});
	}

	/**
	 * Searches spotify albums using query and populates the results object with album information.
	 * @param {string} query - search term
	 * @param {object} results - object for storing data from the service provider's
	 *
	 * @return {promise} - Returns a promise that resolves to either true if resolved or false, when rejected.
	 */
	searchAlbums (query, results) {

		return new Promise(function (resolve, reject) {

			spotifyApi.searchAlbums(query).then(function (data) {

				var albumItems = data.body.albums.items;
				var albums = [];
				for(let ai in albumItems) {

					albums.push({
						album_name : albumItems[ai].name,
						album_image_large :(albumItems[ai].images.length > 0) ? albumItems[ai].images[0].url : ""
					});

				}
				results.albums = albums;
				resolve(true);

			}, function (error) {

				console.log('Error detected ' + error);
				reject(false);

			});

		});

	}

	/**
	 * Searches spotify artists using query and populates the results object with artist information.
	 * @param {string} query - search term
	 * @param {object} results - object for storing data from the service provider's
	 *
	 * @return {promise} - Returns a promise that resolves to either true if resolved or false, when rejected.
	 */
	searchArtists (query, results) {

		return new Promise(function (resolve, reject) {

			spotifyApi.searchArtists(query).then(function (data) {

				var artistItems = data.body.artists.items;
				var artists = [];
				for(let ai in artistItems) {
					console.log(artistItems[ai].images.length);
					artists.push({
						artist_name : artistItems[ai].name,
						artist_popularity : artistItems[ai].popularity,
						artist_image_large : (artistItems[ai].images.length > 0) ? artistItems[ai].images[0].url : ""
					});

				}
				results.artists = artists;
				resolve(true);

			}, function (error) {

				console.log('Error detected ' + error);
				reject(false);

			});

		});

	}
}

export default SpotifyService;

