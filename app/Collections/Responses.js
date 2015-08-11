import 'backbonefire';
import { Firebase } from 'backbone';
import { BaseURL } from '../config';
import Response from '../Models/Response';

/*
	This class is responsible for maintaining the responses collection.
*/

class Responses extends Firebase.Collection {

	/* 
		Description: Initializes the responses collection.
		Parameters: Models (supporting models), options (supporting options)
		Signature: (Object, Object) -> Void
	*/

	initialize (models, opts) {

		this.model = Response;
		this.url = `${BaseURL}/responses`;
		this.autoSync = true;

	}

	/* 
		Description: Creates and adds a Response model to the collection, and then returns it.
		Parameters: reqId (used in conjuction with provider to generate an id, 
					provider (used in conjuction with reqId to generate an id, 
					contents (object containing results info)
		Signature: (String, String, Object) -> Object
	*/

	createResponse (reqId, provider, contents) {

		return this.create({
			id : `${reqId}/${provider}`,
			meta : {
				time_completed : Date.now(),
			},
			results : contents
		});

	}

}

export default Responses;