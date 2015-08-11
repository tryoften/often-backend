import 'backbonefire';
import ServiceBase from '../ServiceBase';
import { Settings as settings } from './config';

var spotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new spotifyWebApi();

class SpotifyService extends ServiceBase {
	
	/* 
		Description: Initializes the spotify service provider.
		Parameters: Models (supporting models)
		Signature: (Object) -> Void
	*/

	constructor (models) {

		super(models, settings);

	}
	
	/* 
		Description: Main method for obtaining results from the service provider's API. Results are returned as a promise.
		Parameters: Query (search term)
		Signature: (String) -> Promise
	*/

	fetchData (query) {

		return new Promise((resolve, reject) => {

			var results = {};
			this.getSpotifyData(query, results).then(function (data) {

				resolve(results);

			});

		});

	}

	/* 
		Description: Barrier method for collecting results from multiple service provider API calls. Returns a promise when all sub-promises are fulfilled.
		Parameters: Query (search term), results (object for storing data from the service provider's)
		Signature: (String, Object) -> Promise
	*/

	getSpotifyData (query, results) {

		return Promise.all([

			this.searchArtists(query, results),
			this.searchAlbums(query, results),
			this.searchTracks(query, results),
			this.searchPlaylists(query, results)

		]);
		
	}

	/* 
		Description: Searches spotify playlists using query and populates the results object with playlist information. Returns a promise.
		Parameters: Query (search term), results (object for storing data from the service provider's)
		Signature: (String, Object) -> Promise
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

	/* 
		Description: Searches spotify tracks using query and populates the results object with tracks information. Returns a promise.
		Parameters: Query (search term), results (object for storing data from the service provider's)
		Signature: (String, Object) -> Promise
	*/

	searchTracks (query, resObj) {
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
				resObj.tracks = tracks;
				resolve(true);

			}, function (error) {

				console.log('Error detected ' + error);
				reject(false);

			});

		});
	}

	/* 
		Description: Searches spotify albums using query and populates the results object with albums information. Returns a promise.
		Parameters: Query (search term), results (object for storing data from the service provider's)
		Signature: (String, Object) -> Promise
	*/

	searchAlbums (query, resObj) {

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
				resObj.albums = albums;
				resolve(true);

			}, function (error) {

				console.log('Error detected ' + error);
				reject(false);

			});

		});

	}

	/* 
		Description: Searches spotify artists using query and populates the results object with artists information. Returns a promise.
		Parameters: Query (search term), results (object for storing data from the service provider's)
		Signature: (String, Object) -> Promise
	*/

	searchArtists (query, resObj) {

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
				resObj.artists = artists;
				resolve(true);

			}, function (error) {

				console.log('Error detected ' + error);
				reject(false);

			});

		});

	}
}

export default SpotifyService;

