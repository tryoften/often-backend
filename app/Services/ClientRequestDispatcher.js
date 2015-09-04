import Responses from '../Collections/Responses';
import Search from '../Search/Search';
import SpotifyService from './Spotify/SpotifyService';
import GiphyService from './Giphy/GiphyService';
import YouTubeService from './YouTube/YouTubeService';
import SoundCloudService from './SoundCloud/SoundCloudService';
import _ from 'underscore';

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

		this.responses = new Responses();
		this.search = new Search();

		/* service provider name to service instances map */
		this.serviceProviders = {};
		this.serviceProviders.spotify = new SpotifyService({responses : this.responses});
		this.serviceProviders.giphy = new GiphyService({responses : this.responses});
		this.serviceProviders.youtube = new YouTubeService({responses : this.responses});
		this.serviceProviders.soundcloud = new SoundCloudService({responses : this.responses});

	}

	/**
	 * Determines which service provider the request should be executed with and executes it.
	 * @param {object} incomingRequest - contains information about an incoming request.
	 *
	 * @return {Promise} -- Resolves to true when all service callbacks have completed
	 */
	process (incomingRequest) {

		return new Promise((resolve, reject) => {

			/* whether the query is for autocomplete suggestions */
			var isAutocomplete = !!incomingRequest.query.autocomplete;

			/* store the total number of services left to process */
			var servicesLeftToProcess = Object.keys(this.serviceProviders).length;
			this.responses.on('change:time_modified', (updatedResponse) => {

				if (incomingRequest.id != updatedResponse.id) {
					return;
				}

				/* query search */
				var searchTerm = incomingRequest.query.text;
				var promise = (isAutocomplete) ? this.search.suggest(searchTerm) : this.search.query(searchTerm);

				promise.then((data) => {
					updatedResponse.set({
						doneUpdating: false,
						results: data
					});

					if (!isAutocomplete) {
						/* Decrement the count of services to process & resolve when all services have completed successfully */
						servicesLeftToProcess--;
						if (servicesLeftToProcess === 0) {
							updatedResponse.set('doneUpdating', true);
							resolve(true);
						}
					} else {
						resolve(true);
					}
				});

			});

			/* create a new response */
			var resp = this.responses.create({ 
				id: incomingRequest.id,
				query: incomingRequest.query.text,
				doneUpdating: false,
				autocomplete: isAutocomplete
			});

			var outgoingResponse = this.responses.get(resp.id);
			console.log('incoming id: ' + resp.id);

			/* triggers change:time_modified event */
			outgoingResponse.set({
				time_modified: Date.now()
			});

			if (!isAutocomplete) {
				/* Execute the request every user provider that the user is subscribed */
				var providers = Object.keys(this.serviceProviders);
				for (let i in providers) {					
					this.serviceProviders[providers[i]].execute(incomingRequest, outgoingResponse);
				}

				// if nothing happens after 2 seconds: timeout
				setTimeout(reject, 5000, 'timeout');
			} else {
				setTimeout(reject, 1000, 'timeout');
			}

		});
		
	}
}

export default ClientRequestDispatcher;
