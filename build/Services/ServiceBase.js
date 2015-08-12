'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _CollectionsCachedResponses = require('../Collections/CachedResponses');

var _CollectionsCachedResponses2 = _interopRequireDefault(_CollectionsCachedResponses);

/** 
 *	This class is a base class for all service providers. 
 *	It has an instance of the results collection to which it adds a response after processing.
 *	It also keeps tracks of a cache for the derived class's responses.
 */

var ServiceBase = (function () {

	/**
  * Initializes the service base.
  * @param {object} models - supporting models
  * @param {object} opts - supporting options
  *
  * @return {Void}
  */

	function ServiceBase(models, opts) {
		_classCallCheck(this, ServiceBase);

		this.responses = models.responses;
		this.provider_id = opts.provider_name;
		this.fetch_interval = opts.fetch_interval || 30000; //30 second default
		this.cachedResponses = new _CollectionsCachedResponses2['default']({ provider: opts.provider_name });
	}

	_createClass(ServiceBase, [{
		key: 'execute',

		/**
   * Method for executing a request with a service provider.
   * @param {object} request - request to be processed
   *
   * @return {Void}
   */
		value: function execute(request) {
			var _this = this;

			var query = request.get('query');
			var requestId = request.id;

			/* Sync the cache */
			this.cachedResponses.once('sync', function (cr) {

				/* Check if the cache for the query is valid */
				if (_this.cachedResponses.isCacheValid(_this.fetch_interval, query)) {

					/* If so create a response based off of cached results */
					var results = _this.cachedResponses.getResults(query);
					_this.responses.createResponse(requestId, _this.provider_id, results);
				} else {

					/* Otherwise refresh the cache by obtaining new data from derived class via fetchData method */
					_this.fetchData(query).then(function (results) {

						/* Create a response based off of returned results and update the cache */
						var response = _this.responses.createResponse(requestId, _this.provider_id, results);
						_this.cachedResponses.cacheResponse(query, response);
					});
				}
			});

			/* Force the sync event to occur in case the cache is empty */
			this.cachedResponses.fetch();
		}
	}]);

	return ServiceBase;
})();

exports['default'] = ServiceBase;
module.exports = exports['default'];
//# sourceMappingURL=ServiceBase.js.map