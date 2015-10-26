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
			this.getSpotifyData(query, results).then((data) => {
				resolve(results);
			}, (error) => {
				reject(error);
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
			this.searchTracks(query, results)
		]);
		
	}

	/**
	 * Searches spotify playlists using query and populates the results object with playlist information.
	 * @param {string} query - search term
	 * @param {object} results - object for storing data from the service provider's
	 *
	 * @return {promise} - Returns a promise that resolves to either true if resolved or error, when rejected.
	 */
	searchPlaylists (query, results) {

		return new Promise(function (resolve, reject) {

			spotifyApi.searchPlaylists(query).then(function (data) {

				var playlistItems = data.body.playlists.items;
				var playlists = [];

				for (let pi in playlistItems) {
					playlists.push({
						id : playlistItems[pi].id,
						name : playlistItems[pi].name,
						image : playlistItems[pi].images[0].url,
						owner_name : playlistItems[pi].owner.id,
						uri : playlistItems[pi].uri
					});
				}

				results.playlist = playlists;
				resolve(true);

			}, function (error) {

				console.log('Error detected ' + error);
				reject(error);

			});

		});

	}
	
	/**
	 * Searches spotify tracks using query and populates the results object with track information.
	 * @param {string} query - search term
	 * @param {object} results - object for storing data from the service provider's
	 *
	 * @return {promise} - Returns a promise that resolves to either true if resolved or error, when rejected.
	 */
	searchTracks (query, results) {
		return new Promise( (resolve, reject) => {

			spotifyApi.searchTracks(query).then( (data) => {

				var trackItems = data.body.tracks.items;
				var tracks = [];

				for (let trackData of trackItems) {
					tracks.push({
						id: trackData.id,
						name: trackData.name,
						image_large: trackData.album.images[0].url,
						album_name: trackData.album.name,
						artist_name: trackData.artists[0].name,
						external_url : "https://play.spotify.com/track/"+trackData.id,
						url: trackData.href,
						uri: trackData.uri,
						explicit: trackData.explicit
					});
				}
				this.shortenUrls(tracks).then( () => {
					results.track = tracks;
					resolve(true);
				})
				.catch( (err) => { reject(err); } );

			}, (error) => {

				console.log('Error detected ' + error);
				reject(error);

			});

		});
	}

	/**
	 * Searches spotify albums using query and populates the results object with album information.
	 * @param {string} query - search term
	 * @param {object} results - object for storing data from the service provider's
	 *
	 * @return {promise} - Returns a promise that resolves to either true if resolved or error, when rejected.
	 */
	searchAlbums (query, results) {

		return new Promise(function (resolve, reject) {

			spotifyApi.searchAlbums(query).then(function (data) {

				var albumItems = data.body.albums.items;
				var albums = [];

				for (let albumData of albumItems) {
					albums.push({
						id: albumData.id,
						name: albumData.name,
						image_large: (albumData.images.length > 0) ? albumData.images[0].url : ""
					});
				}

				results.album = albums;
				resolve(true);

			}, function (error) {

				console.log('Error detected ' + error);
				reject(error);

			});

		});

	}

	/**
	 * Searches spotify artists using query and populates the results object with artist information.
	 * @param {string} query - search term
	 * @param {object} results - object for storing data from the service provider's
	 *
	 * @return {promise} - Returns a promise that resolves to either true if resolved or error, when rejected.
	 */
	searchArtists (query, results) {

		return new Promise(function (resolve, reject) {

			spotifyApi.searchArtists(query).then(function (data) {

				var artistItems = data.body.artists.items;
				var artists = [];

				for (let artistData of artistItems) {
					artists.push({
						id : artistData.id,
						name : artistData.name,
						popularity : artistData.popularity,
						image_large : (artistData.images.length > 0) ? artistData.images[0].url : ""
					});
				}
				//console.log(artistData);
				results.artist = artists;
				resolve(true);

			}, function (error) {

				console.log('Error detected ' + error);
				reject(error);

			});

		});

	}
}

export default SpotifyService;

