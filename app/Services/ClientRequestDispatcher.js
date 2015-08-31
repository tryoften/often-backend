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

			/* store the total number of services left to process */
			var servicesLeftToProcess = Object.keys(this.serviceProviders).length;
			this.responses.on('change:time_modified', (updatedResponse) => {

				if (incomingRequest.id != updatedResponse.id) {
					return;
				}

				/* query search */
				var searchTerm = incomingRequest.query;
				this.search.query(searchTerm).then((data) => {
					var results = this.serializeAndSortResults(data);
					updatedResponse.set({
						'doneUpdating': false,
						'results': results
					});

					/* Decrement the count of services to process & resolve when all services have completed successfully */
					servicesLeftToProcess--;
					if(servicesLeftToProcess === 0) {
						updatedResponse.set('doneUpdating', true);
						resolve(true);
					}

				});

			});

			/* create a new response */
			var resp = this.responses.create({ 
				id: incomingRequest.id,
				query: incomingRequest.query,
				doneUpdating: false
			});

			var outgoingResponse = this.responses.get(resp.id);
			console.log('incoming id: ' + resp.id);

			/* Execute the request every user provider that the user is subscribed */
			var providers = Object.keys(this.serviceProviders);
			for (let i in providers){					
				this.serviceProviders[providers[i]].execute(incomingRequest, outgoingResponse);
			}

		});
		
	}

	/**
	 * Creates a formatted results array using data returned from search and sorts it using the score.
	 * @param {object} data - object containing data from search
	 *
	 * @return {[object]} - array of objects
	 */
	serializeAndSortResults (data) {
		var results = [];
		let buckets = data.aggregations['top-providers'].buckets;
		for (let i in buckets) {
			var indResults = buckets[i]['top-provider-hits'].hits.hits;
			for (let j in indResults) {
				var singleResult = {
					'_index' : indResults[j]._index,
					'_type' : indResults[j]._type,
					'_score' : indResults[j]._score,
					'_id' : indResults[j]._id
				};
				var source = indResults[j]._source;
				for (let k in source){
					singleResult[k] = source[k];
				}
				results.push(singleResult);
			}
		}
		//sort array by score
		results.sort(function(a,b){return b._score - a._score;});
		return results;
	}	
}

export default ClientRequestDispatcher;
