import Requests from '../Collections/Requests';
import Responses from '../Collections/Responses';
import Search from '../Search/Search';
import SpotifyService from './Spotify/SpotifyService';
import GiphyService from './Giphy/GiphyService';
import YouTubeService from './YouTube/YouTubeService';
import SoundCloudService from './SoundCloud/SoundCloudService';

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
		this.search = new Search();
		this.serviceProviders = {};
		this.serviceProviders.spotify = new SpotifyService({responses : this.responses});
		this.serviceProviders.giphy = new GiphyService({responses : this.responses});
		this.serviceProviders.youtube = new YouTubeService({responses : this.responses});
		this.serviceProviders.soundcloud = new SoundCloudService({responses : this.responses});
		
	}

	/**
	 * Determines which service provider the request should be executed with and executes it.
	 *
	 * @return {void}
	 */
	process () {

			/* Set up an event listener for new requests */
			this.requests.on('add', (incomingRequest) => {				

				/* For every user provider that the user is subscribed to */
				var providers = Object.keys(this.serviceProviders);
				for (let i in providers){					
					/* create a new response */
					var resp = this.responses.create({ 
						id : incomingRequest.id
					});

					var outgoingResponse = this.responses.get(resp.id);
					this.serviceProviders[providers[i]].execute(incomingRequest, outgoingResponse);
				}

			});

			this.responses.on('change:time_modified', (updatedResponse) => {

				/* query search */
				var searchTerm = this.requests.get(updatedResponse.id).get('query');
				console.log('search term is: '+ searchTerm);
				debugger;
				this.search.query(searchTerm).then((data) => {
					console.log('got data back');
					updatedResponse.set('results', data.hits.hits);
				});
			});

	}
}

export default ClientRequestDispatcher;