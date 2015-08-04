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

var _ModelsCachedResultsManager = require('../Models/CachedResultsManager');

var _ModelsCachedResultsManager2 = _interopRequireDefault(_ModelsCachedResultsManager);

var ServiceBase = (function () {
	function ServiceBase() {
		_classCallCheck(this, ServiceBase);

		this.cachedResultsManager = new _ModelsCachedResultsManager2['default']();
	}

	_createClass(ServiceBase, [{
		key: 'isCacheValid',
		value: function isCacheValid(queryProviderCompletedTime) {
			if (!queryProviderCompletedTime) return false;
			return Date.now() - this.fetch_interval < queryProviderCompletedTime;
		}
	}, {
		key: 'execute',
		value: function execute(request) {
			var _this = this;

			// Executes the request with the provider
			return new Promise(function (resolve, reject) {
				var queryString = request.get('query');
				var requestId = request.id;

				//Check if the check hasn't expired, and resolve cached data
				_this.cachedResultsManager.once('sync', function (crm) {
					var providerResultCompletedTime = _this.cachedResultsManager.queryProviderCompletedTime(queryString, _this.provider_id);

					if (_this.isCacheValid(providerResultCompletedTime)) {
						var resp = _this.cachedResultsManager.providerResult(queryString, _this.provider_id);
						resp.id = '' + requestId + '/' + _this.provider_id;
						resolve(resp);
					} else {
						_this.fetchData(queryString).then(function (contents) {
							var resp = {
								id: '' + request.id + '/' + _this.provider_id,
								meta: {
									time_completed: Date.now() },
								results: contents
							};
							// update the cache
							var providerResultMap = {};
							providerResultMap[_this.provider_id] = resp;

							var queryProviderResultMap = {};
							queryProviderResultMap[queryString] = providerResultMap;

							_this.cachedResultsManager.set(queryProviderResultMap);
							_this.cachedResultsManager.save();
							resolve(resp);
						});
					}
				});
				_this.cachedResultsManager.fetch();
			});
		}
	}]);

	return ServiceBase;
})();

exports['default'] = ServiceBase;
module.exports = exports['default'];
//# sourceMappingURL=ServiceBase.js.map