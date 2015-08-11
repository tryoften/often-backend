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

/*
	This class is responsible for maintaining provider-level response cache.
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

		/* 
  	Description: Initializes the cached responses collection.
  	Parameters: Models (supporting models), options (supporting options)
  	Signature: (Object, Object) -> Void
  */

		value: function initialize(models, opts) {

			this.model = _ModelsCachedResponse2['default'];
			this.url = '' + _config.BaseURL + '/cached-responses/' + models.provider;
			this.autoSync = true;
		}
	}, {
		key: 'cacheResponse',

		/* 
  	Description: Retrieves the results body of the response.
  	Parameters: Query (new key), response (contains results and metadata info)
  	Signature: (String, Object) -> Object
  */

		value: function cacheResponse(query, response) {

			response.id = query;
			return this.add(response);
		}
	}, {
		key: 'getResults',

		/* 
  	Description: Retrieves the results body of the response.
  	Parameter: Query (key) for the cache.
  	Signature: (String) -> Object
  */

		value: function getResults(query) {

			var cachedResult = this.get(query);
			return cachedResult ? cachedResult.getResults() : null;
		}
	}, {
		key: 'getTimeCompleted',

		/* 
  	Description: Retrieves the time when the response was generated.
  	Parameter: Query (key) for the cache.
  	Signature: (String) -> Integer
  */

		value: function getTimeCompleted(query) {

			var cachedResult = this.get(query);
			return cachedResult ? cachedResult.getTimeCompleted() : null;
		}
	}, {
		key: 'isCacheValid',

		/* 
  	Description: Checks if the cache is valid (hasn't expired).
  	Parameter: Datetime in milliseconds from the start of the epoch.
  	Signature: (Integer) -> Bool
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