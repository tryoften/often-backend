import Firebase from 'backbonefire';
import config from '../config';
import Response from '../Models/Response';
import * as fb from 'firebase';
import UserTokenGenerator from '../Auth/UserTokenGenerator';

/**
 * This class is responsible for maintaining the responses collection.
 */

class Responses extends Firebase.Collection<Response> {

	/**
	 * Initializes the responses collection.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	initialize (models: Response[], opts: any) {
		this.model = Response;
		this.url = UserTokenGenerator.getAdminReference(`${config.firebase.BaseURL}/responses`);
		this.autoSync = true;
	}

	/**
	 * Creates and adds a Response model to the collection, and then returns it.
	 * @param {string} reqId - used in conjuction with provider to generate an id of new model
	 * @param {string} provider - used in conjuction with reqId to generate an id of new model
	 * @param {object} contents - object containing results to be added to the response 
	 *
	 * @return {Response} - returns a Response object
	 */
	createResponse (reqId: string, provider: string, contents: any): Response {

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
