import 'backbonefire';
import { Firebase } from 'backbone';
import { BaseURL } from '../config';
import Request from '../Models/Request';

/*
	This class is responsible for maintaining and syncing Request collection.
*/

class Requests extends Firebase.Collection {

	/* 
		Description: Initializes the requests collection.
		Parameters: Models (supporting models), options (supporting options)
		Signature: (Object, Object) -> Void
	*/

	initialize (models, opts) {

		this.model = Request;
		this.url = `${BaseURL}/requests`;
		this.autoSync = true;

	}
}

export default Requests;
