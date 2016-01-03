import { Model } from 'backbone';

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for cached responses.
 */
class CachedResponse extends Model {

	/**
	 * Return the time the cached response was last completed (generated).
	 *
	 * @return {int} - time the response was completed
	 */
	getTimeCompleted () {

		return this.get('meta').time_completed;

	}
	
	/**
	 * Returns the results of the cached response.
	 *
	 * @return {[object]} - arry of result objects
	 */
	getResults () {

		return this.get('results');

	}
}

export default CachedResponse;