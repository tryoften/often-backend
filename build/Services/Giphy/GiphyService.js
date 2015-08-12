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

var GiphyService = (function (_ServiceBase) {

	/**
  * Initializes the giphy service provider.
  * @param {object} models - supporting models
  *
  * @return {void}
  */

	function GiphyService(models) {
		_classCallCheck(this, GiphyService);

		_get(Object.getPrototypeOf(GiphyService.prototype), 'constructor', this).call(this, models, _config.Settings);
		this.rest = new _restler.Service({
			baseURL: _config.Settings.base_url
		});
	}

	_inherits(GiphyService, _ServiceBase);

	_createClass(GiphyService, [{
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

				var results = [];
				_this2.rest.get(_config.Settings.base_url, {
					query: {
						q: query,
						api_key: _config.Settings.api_key
					}
				}).on('success', function (data) {
					var gifsArray = data.data;
					for (var i in gifsArray) {
						results.push({
							embed_url: gifsArray[i].embed_url
						});
					}
					resolve(results);
				}).on('error', function (err) {
					console.log('err' + err);
					reject(err);
				});
			});
		}
	}]);

	return GiphyService;
})(_ServiceBase3['default']);

exports['default'] = GiphyService;
module.exports = exports['default'];
//# sourceMappingURL=GiphyService.js.map