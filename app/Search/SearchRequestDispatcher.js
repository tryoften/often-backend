//import Responses from '../Collections/Responses';
import Search from '../Search/Search';
import SearchParser from '../Search/SearchParser';
import SpotifyService from '../Services/Spotify/SpotifyService';
import YouTubeService from '../Services/YouTube/YouTubeService';
import SoundCloudService from '../Services/SoundCloud/SoundCloudService';
import _ from 'underscore';
import Backbone from 'backbone';
import Response from '../Models/Response';

/**
 * This class is responsible for figuring out which service provider must handle a given incoming request.
 * This class calls the 'execute' method of an appropriate service provider (as per request) and keeps track of the response.
 */
class SearchRequestDispatcher extends Backbone.Model {

	/**
	 * Initializes the client request dispatcher.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	constructor () {
		super();
		this.search = new Search();

		/* service provider name to service instances map */
		this.serviceProviders = {};
		this.serviceProviders.spotify = new SpotifyService({responses : this.responses});
		this.serviceProviders.youtube = new YouTubeService({responses : this.responses});
		this.serviceProviders.soundcloud = new SoundCloudService({responses : this.responses});

		this.searchParser = new SearchParser();
	}

	getRelevantProviders (filter) { 
		if (filter === "") {
			return Object.keys(this.serviceProviders);

		} else if (!_.isUndefined(this.serviceProviders[filter])) {
			return [filter];

		} else {
			return [];

		}
	}

	/**
	 * Determines which service provider the request should be executed with and executes it.
	 * @param {object} incomingRequest - contains information about an incoming request.
	 *
	 * @return {Promise} -- Resolves to true when all service callbacks have completed
	 */
	process (request) {

		return new Promise((resolve, reject) => {
			console.log("Request Id: " + request.id);
			var parsedContents = this.searchParser.parse(request.query.text);
				
			/* whether the query is for autocomplete suggestions */
			var isAutocomplete = !!request.query.autocomplete;

			var filter = parsedContents.filter;
			var actualQuery = parsedContents.actualQuery;

			/* store the total number of services left to process */
			var relevantProviders = this.getRelevantProviders(filter);
			var servicesLeftToProcess = relevantProviders.length;
			
			var response = new Response({
				id: request.id
			});
			
			response.setInitialValues({
				query: request.query.text,
				doneUpdating: false,
				autocomplete: isAutocomplete
			});

			this.on('query', () => {
				var promise = (isAutocomplete) ? this.search.suggest(filter, actualQuery) : this.search.query(actualQuery, filter);
				promise.then( (data) => { 
					response.updateResults(data);
					if(servicesLeftToProcess === 0 || isAutocomplete) {
						response.complete();
						response = null;
						resolve(true);
					}
				});
			});

			/* Emit query event once */
			this.trigger('query');

			if (!isAutocomplete) {
				/* Execute the request every user provider that the user is subscribed */
				for (let providerName of relevantProviders) {
					this.serviceProviders[providerName].execute(request).then( (fulfilled) => {
						servicesLeftToProcess--;
						this.trigger('query');

					}).catch( (rejected) =>{
						servicesLeftToProcess--;
					});
					
				}

				// if nothing happens after 2 seconds: timeout
				setTimeout(reject, 5000, 'timeout');
			} else {
				setTimeout(reject, 1000, 'timeout');
			}
		}).catch( err => { reject(err); });
		
	}
}

export default SearchRequestDispatcher;
