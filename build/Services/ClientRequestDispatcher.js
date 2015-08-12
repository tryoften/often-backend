'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _CollectionsRequests = require('../Collections/Requests');

var _CollectionsRequests2 = _interopRequireDefault(_CollectionsRequests);

var _CollectionsResponses = require('../Collections/Responses');

var _CollectionsResponses2 = _interopRequireDefault(_CollectionsResponses);

var _SpotifySpotifyService = require('./Spotify/SpotifyService');

var _SpotifySpotifyService2 = _interopRequireDefault(_SpotifySpotifyService);

var _GiphyGiphyService = require('./Giphy/GiphyService');

var _GiphyGiphyService2 = _interopRequireDefault(_GiphyGiphyService);

var _YouTubeYouTubeService = require('./YouTube/YouTubeService');

var _YouTubeYouTubeService2 = _interopRequireDefault(_YouTubeYouTubeService);

var _SoundCloudSoundCloudService = require('./SoundCloud/SoundCloudService');

var _SoundCloudSoundCloudService2 = _interopRequireDefault(_SoundCloudSoundCloudService);

var _CollectionsUsers = require('../Collections/Users');

var _CollectionsUsers2 = _interopRequireDefault(_CollectionsUsers);

/**
 * This class is responsible for figuring out which service provider must handle a given incoming request.
 * This class calls the 'execute' method of an appropriate service provider (as per request) and keeps track of the response.
 */

var ClientRequestDispatcher = (function () {

	/**
  * Initializes the client request dispatcher.
  * @param {object} models - supporting models
  * @param {object} opts - supporting options
  *
  * @return {void}
  */

	function ClientRequestDispatcher(models, opts) {
		_classCallCheck(this, ClientRequestDispatcher);

		this.requests = new _CollectionsRequests2['default']();
		this.responses = new _CollectionsResponses2['default']();
		this.serviceProviders = {};
		this.serviceProviders.spotify = new _SpotifySpotifyService2['default']({ responses: this.responses });
		this.serviceProviders.giphy = new _GiphyGiphyService2['default']({ responses: this.responses });
		this.serviceProviders.youtube = new _YouTubeYouTubeService2['default']({ responses: this.responses });
		this.serviceProviders.soundcloud = new _SoundCloudSoundCloudService2['default']({ responses: this.responses });
		this.users = new _CollectionsUsers2['default']();
	}

	_createClass(ClientRequestDispatcher, [{
		key: 'process',

		/**
   * Determines which service provider the request should be executed with and executes it.
   *
   * @return {void}
   */
		value: function process() {
			var _this = this;

			/* Sync up the user collection to retrieve a list of all users and the servides they are subscribed to */
			this.users.once('sync', function (x) {

				/* Set up an event listener for new requests */
				_this.requests.on('add', function (incomingRequest) {

					/* Obtain a list of all the providers the user is subscribed to */
					var user_id = incomingRequest.get('user');
					var user_providers = _this.users.get(user_id).get('providers');

					/* For every user provider that the user is subscribed to */
					for (var providerName in user_providers) {

						/* In the unlikely event that the provider for the user request is not found, just write to stdout */
						if (!_this.serviceProviders[providerName]) {

							console.log('No service handlers found for the following provider: ' + providerName);
						} else {

							/* If the provider is found, then execute the incoming request using the instance of an appropriate provider handler */
							console.log('Provider handler found');
							_this.serviceProviders[providerName].execute(incomingRequest);
						}
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