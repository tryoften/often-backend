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

var _restler = require('restler');

/** 
 * This class is responsible for fetching data from the Giphy API
 */

var SoundCloudService = (function (_ServiceBase) {

	/**
  * Initializes the soundcloud service provider.
  * @param {object} models - supporting models
  *
  * @return {void}
  */

	function SoundCloudService(models) {
		_classCallCheck(this, SoundCloudService);

		_get(Object.getPrototypeOf(SoundCloudService.prototype), 'constructor', this).call(this, models, _config.Settings);
		this.rest = new _restler.Service({
			baseURL: _config.Settings.base_url
		});
	}

	_inherits(SoundCloudService, _ServiceBase);

	_createClass(SoundCloudService, [{
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
				_this2.getSoundCloudData(query, results).then(function (data) {

					resolve(results);
				});
			});
		}
	}, {
		key: 'getSoundCloudData',

		/**
   * Barrier method for collecting results from multiple service provider API calls.
   * @param {string} query - search term
   * @results {object} results - object for storing data from the service provider's
   *
   * @return {promise} - Returns a promise when all sub-promises are resolved or an error on rejection.
   */
		value: function getSoundCloudData(query, results) {

			return Promise.all([this.searchTracks(query, results), this.searchUsers(query, results)]);
		}
	}, {
		key: 'searchUsers',

		/**
   * Searches soundlcoud users using query and populates the results object with user information.
   * @param {string} query - search term
   * @param {object} results - object for storing data from the service provider's
   *
   * @return {promise} - Returns a promise that resolves to either true if resolved or false, when rejected.
   */
		value: function searchUsers(query, results) {
			var _this3 = this;

			return new Promise(function (resolve, reject) {

				_this3.rest.get('' + _config.Settings.base_url + '/users', {
					query: {
						q: query,
						client_id: _config.Settings.client_id
					}
				}).on('success', function (data) {
					var userResults = data;
					var users = [];
					for (var i in userResults) {
						users.push({
							first_name: userResults[i].first_name,
							last_name: userResults[i].last_name,
							followings_count: userResults[i].followings_count,
							track_count: userResults[i].track_count
						});
					}
					results.users = users;
					resolve(true);
				}).on('error', function (err) {
					console.log('err' + err);
					reject(false);
				});
			});
		}
	}, {
		key: 'searchTracks',

		/**
   * Searches soundcloud tracks using query and populates the results object with track information.
   * @param {string} query - search term
   * @param {object} results - object for storing data from the service provider's
   *
   * @return {promise} - Returns a promise that resolves to either true if resolved or false, when rejected.
   */
		value: function searchTracks(query, results) {
			var _this4 = this;

			return new Promise(function (resolve, reject) {

				_this4.rest.get('' + _config.Settings.base_url + '/tracks', {
					query: {
						q: query,
						client_id: _config.Settings.client_id
					}
				}).on('success', function (data) {
					var trackResults = data;
					var tracks = [];
					for (var i in trackResults) {
						tracks.push({
							title: trackResults[i].title,
							url: trackResults[i].uri,
							duration: trackResults[i].duration
						});
					}
					results.tracks = tracks;
					resolve(true);
				}).on('error', function (err) {
					console.log('err' + err);
					reject(false);
				});
			});
		}
	}]);

	return SoundCloudService;
})(_ServiceBase3['default']);

exports['default'] = SoundCloudService;
module.exports = exports['default'];
//# sourceMappingURL=SoundCloudService.js.map