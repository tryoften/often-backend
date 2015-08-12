'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

require('backbonefire');

var _backbone = require('backbone');

var _config = require('../config');

var _ModelsCachedResponse = require('../Models/CachedResponse');

var _ModelsCachedResponse2 = _interopRequireDefault(_ModelsCachedResponse);

/**
 * This class is responsible for maintaining provider-level response cache.
 */

var CachedResponses = (function (_Firebase$Collection) {
	function CachedResponses() {
		_classCallCheck(this, CachedResponses);

		if (_Firebase$Collection != null) {
			_Firebase$Collection.apply(this, arguments);
		}
	}

	_inherits(CachedResponses, _Firebase$Collection);

	_createClass(CachedResponses, [{
		key: 'initialize',

		/**
   * Initializes the cached responses collection.
   * @param {object} models - supporting models
   * @param {object} options - supporting options
   *
   * @return {void}
   */
		value: function initialize(models, opts) {

			this.model = _ModelsCachedResponse2['default'];
			this.url = '' + _config.BaseURL + '/cached-responses/' + models.provider;
			this.autoSync = true;
		}
	}, {
		key: 'cacheResponse',

		/**
   * Adds the response to the cache and returns it.
   * @param {string} query - search term (used as key in the cache)
   * @param {object} response - response containing results info and relevant meta (used as value)
   *
   * @return {void}
   */
		value: function cacheResponse(query, response) {

			response.id = query;
			this.add(response);
		}
	}, {
		key: 'getResults',

		/**
   * Description: Retrieves the results body of the cached response.
   * @param {string} query - search term (used as key in the cache)
   *
   * @return {object} - results body of the response
   */
		value: function getResults(query) {

			var cachedResult = this.get(query);
			return cachedResult ? cachedResult.getResults() : null;
		}
	}, {
		key: 'getTimeCompleted',

		/**
   * Retrieves the time when the response was generated.
   * @param {string} query - search term (used as key in the cache)
   *
   * @return {int} - time the response was completed
   */
		value: function getTimeCompleted(query) {

			var cachedResult = this.get(query);
			return cachedResult ? cachedResult.getTimeCompleted() : null;
		}
	}, {
		key: 'isCacheValid',

		/**
   * Checks if the cache is valid (hasn't expired).
   * @param {integer} expirationInterval - Cache longevity in milliseconds.
   * @param {string} query - search term (used as key in the cache)
   *
   * @return {int} - time the response was completed
   */
		value: function isCacheValid(expirationInterval, query) {

			var timeCompleted = this.getTimeCompleted(query);
			if (!expirationInterval || !timeCompleted) return false;
			return Date.now() - expirationInterval < timeCompleted;
		}
	}]);

	return CachedResponses;
})(_backbone.Firebase.Collection);

exports['default'] = CachedResponses;
module.exports = exports['default'];
//# sourceMappingURL=CachedResponses.js.map