import 'backbonefire';
import { Firebase } from 'backbone';
import { FirebaseConfig } from '../config';
import Response from '../Models/Response';
import fb from 'firebase';

/**
 * This class is responsible for maintaining the responses collection.
 */

class Responses extends Firebase.Collection {

	/**
	 * Initializes the responses collection.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	initialize (models, opts) {

		this.model = Response;
		this.url = `${FirebaseConfig.BaseURL}/responses`;
		this.autoSync = true;

	}

	/**
	 * Creates and adds a Response model to the collection, and then returns it.
	 * @param {string} reqId - used in conjuction with provider to generate an id of new model
	 * @param {string} provider - used in conjuction with reqId to generate an id of new model
	 * @param {object} contents - object containing results to be added to the response 
	 *
	 * @return {object} - returns a Response object
	 */
	createResponse (reqId, provider, contents) {

		return this.create({
			id : `${reqId}/${provider}`,
			meta : {
				time_completed : Date.now(),
			},
			results : contents,
			doneUpdating: false
		});

	}

}

export default Responses;