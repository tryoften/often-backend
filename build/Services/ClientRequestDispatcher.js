'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _CollectionsClientRequests = require('../Collections/ClientRequests');

var _CollectionsClientRequests2 = _interopRequireDefault(_CollectionsClientRequests);

var _CollectionsResponses = require('../Collections/Responses');

var _CollectionsResponses2 = _interopRequireDefault(_CollectionsResponses);

var _SpotifySpotifyService = require('./Spotify/SpotifyService');

var _SpotifySpotifyService2 = _interopRequireDefault(_SpotifySpotifyService);

var ClientRequestDispatcher = (function () {
	function ClientRequestDispatcher() {
		_classCallCheck(this, ClientRequestDispatcher);

		this.clientRequests = new _CollectionsClientRequests2['default']();
		this.serviceProviders = {};
		this.serviceProviders.spotify = new _SpotifySpotifyService2['default']();
		this.responses = new _CollectionsResponses2['default']();
	}

	_createClass(ClientRequestDispatcher, [{
		key: 'process',
		value: function process() {
			var _this = this;

			this.clientRequests.on('add', function (incomingRequest) {
				console.log('Adding a new client request');
				//get a list of providers that the user is subscribed to
				var user_providers = incomingRequest.get('user').get('providers');
				Object.keys(user_providers).forEach(function (providerName) {
					if (!_this.serviceProviders[providerName]) {
						console.log('No service handlers found for the following provider: ' + providerName);
					} else {
						console.log('Provider handler found');
						_this.serviceProviders[providerName].execute(incomingRequest).then(function (resp) {
							_this.responses.add(resp);
						});
					}
				});
			});
		}
	}]);

	return ClientRequestDispatcher;
})();

exports['default'] = ClientRequestDispatcher;
module.exports = exports['default'];
//# sourceMappingURL=ClientRequestDispatcher.js.map