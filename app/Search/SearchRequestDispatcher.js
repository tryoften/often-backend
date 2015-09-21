import Responses from '../Collections/Responses';
import Search from '../Search/Search';
import SpotifyService from '../Services/Spotify/SpotifyService';
import GiphyService from '../Services/Giphy/GiphyService';
import YouTubeService from '../Services/YouTube/YouTubeService';
import SoundCloudService from '../Services/SoundCloud/SoundCloudService';
import Feeds from '../Collections/Feeds';
import _ from 'underscore';

/**
 * This class is responsible for figuring out which service provider must handle a given incoming request.
 * This class calls the 'execute' method of an appropriate service provider (as per request) and keeps track of the response.
 */
class SearchRequestDispatcher {

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
		
		/* load feeds */
		this.feeds = new Feeds();
	}

	/**
	 * Filters out the sources that will be queried against ElasticSearch based on attached filters
	 * @param {[string]} sources - string array containing sources supported by the search system
	 * @param {[string]} filters - string array containing filters passed in from the client
	 *
	 * @return {[string]} - string array containing only sources that match passed-in filters
	 */
	filterSources (sources, filters) {

		return _.filter(sources, (sourceElement) => { 
			return _.contains(filters, sourceElement.split('-')[0]); 
		});
	}
	
	/**
	 * Extracts the filter string delimited by '#' character and an empty space ' ' 
	 * @param {string} query - raw query string (contains '#' in front)
	 *
	 * @return {string/null} - Returns the filter string (excluding '#' character) if a filter is present, otherwise null.
	 */
	extractFilter (query) {

		if (query === 'undefined' || query.length == 0) return null;
		var firstWord = query.trim().split(' ')[0];
		if (firstWord[0] == '#') {
			return firstWord.substring(1, firstWord.length);
		}
		return null;
	}

	/**
	 * Extracts the actual query string (with filter removed)
	 * @param {string} query - raw query string (contains '#' in front)
	 * @param {string} filter - filter (ex. "spotify", "vibe", etc.)
	 *
	 * @return {string} - Returns the actual query (filter removed)
	 */
	extractActualQuery (query, filter) {

		return query.trim().substring(filter.length + 1, query.length);
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

			/* check which service providers apply */
			this.feeds.getFeedNames().then( (feeds) => {

				/* check for filter tag */
				var filter = this.extractFilter(incomingRequest.query.text);
				var filteredFeeds, filteredProviders, searchTerm;

				if (filter && !isAutocomplete) {

					filteredFeeds = this.filterSources(feeds, [ filter ]);		
					filteredProviders = this.filterSources(Object.keys(this.serviceProviders), [ filter ]);
					searchTerm = this.extractActualQuery(incomingRequest.query.text, filter);				
				} else {

					/* no specific filters attached */
					filteredFeeds = feeds;
					filteredProviders = Object.keys(this.serviceProviders);
					searchTerm = incomingRequest.query.text;
				}

				/* store the total number of services left to process */
				var servicesLeftToProcess = filteredProviders.length;
				this.responses.on('change:time_modified', (updatedResponse) => {

					if (incomingRequest.id != updatedResponse.id) {
						return;
					}

					/* query search */
					var searchIndices = filteredFeeds.concat(filteredProviders);
					var promise = (isAutocomplete) ? this.search.suggest(searchTerm) : this.search.query(searchTerm, searchIndices);

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
					for (let providerName of filteredProviders) {

						this.serviceProviders[providerName].execute(incomingRequest, outgoingResponse);
					}

					// if nothing happens after 2 seconds: timeout
					setTimeout(reject, 5000, 'timeout');
				} else {
					setTimeout(reject, 1000, 'timeout');
				}

			}).catch( err => reject(err) );
		});
	}
}

export default SearchRequestDispatcher;
