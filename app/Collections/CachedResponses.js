import 'backbonefire';
import { Firebase } from 'backbone';
import { BaseURL } from '../config';
import CachedResponse from '../Models/CachedResponse';

/**
 * This class is responsible for maintaining provider-level response cache.
 */
class CachedResponses extends Firebase.Collection {

	/**
	 * Initializes the cached responses collection.
	 * @param {object} models - supporting models
	 * @param {object} options - supporting options
	 *
	 * @return {void}
	 */
	initialize (models, opts) {

		this.model = CachedResponse;
		this.url = `${BaseURL}/cached-responses/${models.provider}`;
		this.autoSync = true;

	}


	/**
	 * Adds the response to the cache and returns it.
	 * @param {string} query - search term (used as key in the cache)
	 * @param {object} response - response containing results info and relevant meta (used as value)
	 *
	 * @return {void}
	 */
	cacheResponse (query, response) {

		response.id = query;
		this.add(response);

	}

	/**
	 * Description: Retrieves the results body of the cached response.
	 * @param {string} query - search term (used as key in the cache)
	 *
	 * @return {object} - results body of the response
	 */
	getResults (query) {

		var cachedResult = this.get(query);
		return cachedResult ? cachedResult.getResults() : null;

	}

	/**
	 * Retrieves the time when the response was generated.
	 * @param {string} query - search term (used as key in the cache)
	 *
	 * @return {int} - time the response was completed
	 */
	getTimeCompleted (query) {

		var cachedResult = this.get(query);
		return cachedResult ? cachedResult.getTimeCompleted() : null;

	}

	/**
	 * Checks if the cache is valid (hasn't expired).
	 * @param {integer} expirationInterval - Cache longevity in milliseconds.
	 * @param {string} query - search term (used as key in the cache)
	 *
	 * @return {int} - time the response was completed
	 */
	isCacheValid (expirationInterval, query) {

		var timeCompleted = this.getTimeCompleted(query);
		if (!expirationInterval || !timeCompleted) return false;
		return Date.now() - expirationInterval < timeCompleted;

	}

}

export default CachedResponses;
