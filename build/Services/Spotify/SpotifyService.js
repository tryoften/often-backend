'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

require('backbonefire');

var _ServiceBase2 = require('../ServiceBase');

var _ServiceBase3 = _interopRequireDefault(_ServiceBase2);

var _config = require('./config');

var spotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new spotifyWebApi();

/** 
 * This class is responsible for fetching data from the Spotify API
 */

var SpotifyService = (function (_ServiceBase) {

	/**
  * Initializes the spotify service provider.
  * @param {object} models - supporting models
  *
  * @return {void}
  */

	function SpotifyService(models) {
		_classCallCheck(this, SpotifyService);

		_get(Object.getPrototypeOf(SpotifyService.prototype), 'constructor', this).call(this, models, _config.Settings);
	}

	_inherits(SpotifyService, _ServiceBase);

	_createClass(SpotifyService, [{
		key: 'fetchData',

		/**
   * Main method for obtaining results from the service provider's API.
   * @param {object} query - search term
   *
   * @return {promise} - Promise that when resolved returns the results of the data fetch, or an error upon rejection.
   */
		value: function fetchData(query) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {

				var results = {};
				_this2.getSpotifyData(query, results).then(function (data) {

					resolve(results);
				});
			});
		}
	}, {
		key: 'getSpotifyData',

		/**
   * Barrier method for collecting results from multiple service provider API calls.
   * @param {string} query - search term
   * @results {object} results - object for storing data from the service provider's
   *
   * @return {promise} - Returns a promise when all sub-promises are resolved or an error on rejection.
   */
		value: function getSpotifyData(query, results) {

			return Promise.all([this.searchArtists(query, results), this.searchAlbums(query, results), this.searchTracks(query, results), this.searchPlaylists(query, results)]);
		}
	}, {
		key: 'searchPlaylists',

		/**
   * Searches spotify playlists using query and populates the results object with playlist information.
   * @param {string} query - search term
   * @param {object} results - object for storing data from the service provider's
   *
   * @return {promise} - Returns a promise that resolves to either true if resolved or false, when rejected.
   */
		value: function searchPlaylists(query, results) {

			return new Promise(function (resolve, reject) {

				spotifyApi.searchPlaylists(query).then(function (data) {

					var playlistItems = data.body.playlists.items;
					var playlists = [];
					for (var pi in playlistItems) {

						playlists.push({
							playlist_name: playlistItems[pi].name
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
	}, {
		key: 'searchTracks',

		/**
   * Searches spotify playlists using query and populates the results object with track information.
   * @param {string} query - search term
   * @param {object} results - object for storing data from the service provider's
   *
   * @return {promise} - Returns a promise that resolves to either true if resolved or false, when rejected.
   */
		value: function searchTracks(query, resObj) {
			return new Promise(function (resolve, reject) {
				spotifyApi.searchTracks(query).then(function (data) {

					var trackItems = data.body.tracks.items;
					var tracks = [];
					for (var ti in trackItems) {

						tracks.push({
							track_name: trackItems[ti].name,
							track_image_large: trackItems[ti].album.images[0].url
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
	}, {
		key: 'searchAlbums',

		/**
   * Searches spotify playlists using query and populates the results object with album information.
   * @param {string} query - search term
   * @param {object} results - object for storing data from the service provider's
   *
   * @return {promise} - Returns a promise that resolves to either true if resolved or false, when rejected.
   */
		value: function searchAlbums(query, resObj) {

			return new Promise(function (resolve, reject) {

				spotifyApi.searchAlbums(query).then(function (data) {

					var albumItems = data.body.albums.items;
					var albums = [];
					for (var ai in albumItems) {

						albums.push({
							album_name: albumItems[ai].name,
							album_image_large: albumItems[ai].images.length > 0 ? albumItems[ai].images[0].url : ''
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
	}, {
		key: 'searchArtists',

		/**
   * Searches spotify playlists using query and populates the results object with artist information.
   * @param {string} query - search term
   * @param {object} results - object for storing data from the service provider's
   *
   * @return {promise} - Returns a promise that resolves to either true if resolved or false, when rejected.
   */
		value: function searchArtists(query, resObj) {

			return new Promise(function (resolve, reject) {

				spotifyApi.searchArtists(query).then(function (data) {

					var artistItems = data.body.artists.items;
					var artists = [];
					for (var ai in artistItems) {
						console.log(artistItems[ai].images.length);
						artists.push({
							artist_name: artistItems[ai].name,
							artist_popularity: artistItems[ai].popularity,
							artist_image_large: artistItems[ai].images.length > 0 ? artistItems[ai].images[0].url : ''
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
	}]);

	return SpotifyService;
})(_ServiceBase3['default']);

exports['default'] = SpotifyService;
module.exports = exports['default'];
//# sourceMappingURL=SpotifyService.js.map