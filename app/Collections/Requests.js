import 'backbonefire';
import Firebase from 'firebase';
import Backbone from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import Request from '../Models/Request';

/**
 * This class is responsible for maintaining and syncing Request collection.
 */

class Requests extends Backbone.Firebase.Collection {

	/**
	 * Initializes the requests collection.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	initialize (models, opts) {
		this.model = Request;
		this.url = new Firebase(`${FirebaseConfig.BaseURL}/requests`)
			.orderByChild('time_made')
			.startAt(Date.now());
		this.autoSync = true;
	}
}

export default Requests;
