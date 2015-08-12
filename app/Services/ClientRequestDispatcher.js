import Requests from '../Collections/Requests';
import Responses from '../Collections/Responses';
import SpotifyService from './Spotify/SpotifyService';
import GiphyService from './Giphy/GiphyService';
import YouTubeService from './YouTube/YouTubeService';
import Users from '../Collections/Users';

/**
 * This class is responsible for figuring out which service provider must handle a given incoming request.
 * This class calls the 'execute' method of an appropriate service provider (as per request) and keeps track of the response.
 */
class ClientRequestDispatcher {

	/**
	 * Initializes the client request dispatcher.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	constructor (models, opts) {

		this.requests = new Requests();
		this.responses = new Responses();
		this.serviceProviders = {};
		this.serviceProviders.spotify = new SpotifyService({responses : this.responses});
		this.serviceProviders.giphy = new GiphyService({responses : this.responses});
		this.serviceProviders.youtube = new YouTubeService({responses : this.responses});
		this.users = new Users();
		
	}

	/**
	 * Determines which service provider the request should be executed with and executes it.
	 *
	 * @return {void}
	 */
	process () {

		/* Sync up the user collection to retrieve a list of all users and the servides they are subscribed to */
		this.users.once('sync', (x) => {

			/* Set up an event listener for new requests */
			this.requests.on('add', (incomingRequest) => {
				
				/* Obtain a list of all the providers the user is subscribed to */
				var user_id = incomingRequest.get('user');
				var user_providers = this.users.get(user_id).get('providers');

				/* For every user provider that the user is subscribed to */
				Object.keys(user_providers).forEach((providerName) => {

					/* In the unlikely event that the provider for the user request is not found, just write to stdout */
					if(!this.serviceProviders[providerName]) {
						
						console.log("No service handlers found for the following provider: " + providerName);
					
					} else {

						/* If the provider is found, then execute the incoming request using the instance of an appropriate provider handler */
						console.log('Provider handler found');
						this.serviceProviders[providerName].execute(incomingRequest);
					
					}

				});

			});

		});

	}
}

export default ClientRequestDispatcher;