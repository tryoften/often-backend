import 'backbonefire';
import { Firebase } from 'backbone';
import { FirebaseConfig } from '../config';
import Request from '../Models/Request';
import fb from 'firebase';

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
		this.url = new fb(`${FirebaseConfig.BaseURL}/requests`).orderByChild('time_made').startAt(Date.now());
		this.autoSync = true;

	}
}

export default Requests;
