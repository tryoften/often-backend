import 'backbonefire';
import { Firebase } from 'backbone';
import { BaseURL } from '../config';
import Request from '../Models/Request';

/**
 * This class is responsible for maintaining and syncing Request collection.
 */

class Requests extends Firebase.Collection {

	/**
	 * Initializes the requests collection.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	initialize (models, opts) {

		this.model = Request;
		this.url = `${BaseURL}/requests`;
		this.autoSync = true;

	}
}

export default Requests;
