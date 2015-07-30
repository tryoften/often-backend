'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

require('backbone-relational');

require('backbonefire');

var _backbone = require('backbone');

var _ModelsQueryResult = require('../Models/QueryResult');

var _ModelsQueryResult2 = _interopRequireDefault(_ModelsQueryResult);

var ServiceBase = (function () {
	function ServiceBase() {
		_classCallCheck(this, ServiceBase);

		this.queryResult = new _ModelsQueryResult2['default']();
	}

	_createClass(ServiceBase, [{
		key: 'execute',
		value: function execute(request) {
			var _this = this;

			// Executes the request with the provider
			return new Promise(function (resolve, reject) {
				var cachedQuery = _this.queryResult.get(request.get('query'));
				//Check if the check hasn't expired, and resolve cached data
				if (cachedQuery && Date.now() - _this.fetch_interval > cachedQuery.get(_this.provider_id).get('meta').get('time_completed')) {
					resolve(cachedQuery.get(_this.provider_id));
				} else {
					_this.fetchData(request).then(function (contents) {
						var resp = {
							id: '' + request.id + '/' + _this.provider_id,
							meta: {
								time_completed: Date.now() },
							results: {
								contents: contents
							}
						};
						// update the cache
						var providerResultMap = {};
						providerResultMap[_this.provider_id] = resp;

						var queryProviderResultMap = {};
						queryProviderResultMap[request.get('query')] = providerResultMap;

						_this.queryResult.set(queryProviderResultMap);

						resolve(resp);
					});
				}
			});
		}
	}]);

	return ServiceBase;
})();

exports['default'] = ServiceBase;
module.exports = exports['default'];
//# sourceMappingURL=ServiceBase.js.map