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

		/* service provider name to service instances map */
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
				console.log('adding new');
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
				this.search.query(searchTerm).then((data) => {
					var results = this.serializeAndSortResults(data);
					updatedResponse.set('results', results);
				});
			});

	}

	/**
	 * Creates a formatted results array using data returned from search and sorts it using the score.
	 * @param {object} data - object containing data from search
	 *
	 * @return {[object]} - array of objects
	 */
	serializeAndSortResults(data){
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
					/* set image content type */
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
