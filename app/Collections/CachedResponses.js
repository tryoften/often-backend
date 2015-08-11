import 'backbonefire';
import { Firebase } from 'backbone';
import { BaseURL } from '../config';
import CachedResponse from '../Models/CachedResponse';

/*
	This class is responsible for maintaining provider-level response cache.
*/

class CachedResponses extends Firebase.Collection {

	/* 
		Description: Initializes the cached responses collection.
		Parameters: Models (supporting models), options (supporting options)
		Signature: (Object, Object) -> Void
	*/

	initialize (models, opts) {

		this.model = CachedResponse;
		this.url = `${BaseURL}/cached-responses/${models.provider}`;
		this.autoSync = true;

	}

	/* 
		Description: Retrieves the results body of the response.
		Parameters: Query (new key), response (contains results and metadata info)
		Signature: (String, Object) -> Object
	*/

	cacheResponse (query, response) {

		response.id = query;
		return this.add(response);

	}

	/* 
		Description: Retrieves the results body of the response.
		Parameter: Query (key) for the cache.
		Signature: (String) -> Object
	*/

	getResults (query) {

		var cachedResult = this.get(query);
		return cachedResult ? cachedResult.getResults() : null;

	}

	/* 
		Description: Retrieves the time when the response was generated.
		Parameter: Query (key) for the cache.
		Signature: (String) -> Integer
	*/

	getTimeCompleted (query) {

		var cachedResult = this.get(query);
		return cachedResult ? cachedResult.getTimeCompleted() : null;

	}

	/* 
		Description: Checks if the cache is valid (hasn't expired).
		Parameter: Datetime in milliseconds from the start of the epoch.
		Signature: (Integer) -> Bool
	*/

	isCacheValid (expirationInterval, query) {

		var timeCompleted = this.getTimeCompleted(query);
		if (!expirationInterval || !timeCompleted) return false;
		return Date.now() - expirationInterval < timeCompleted;

	}

}

export default CachedResponses;
