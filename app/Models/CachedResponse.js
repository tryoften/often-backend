import { Model } from 'backbone';

/*
	This class is responsible for providing granular functionalities (mostly accessors) for cached responses.
*/

class CachedResponse extends Model {

	/* 
		Description: Return the time the cached response was last generated.
		Parameters: N/A
		Signature: () -> Integer
	*/

	getTimeCompleted () {

		return this.get('meta').time_completed;

	}
	
	/* 
		Description: Returns the results of the cached response.
		Parameters: N/A
		Signature: () -> Object
	*/

	getResults () {

		return this.get('results');

	}
}

export default CachedResponse;