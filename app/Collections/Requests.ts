import 'backbonefire';
import * as Firebase from 'firebase';
import * as Backbone from 'backbone';
import config from '../config';
import Request from '../Models/Request';

/**
 * This class is responsible for maintaining and syncing Request collection.
 */

class Requests extends Backbone.Firebase.Collection<Request> {

	/**
	 * Initializes the requests collection.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	initialize (models: Request[], opts: any) {
		this.model = Request;
		this.url = new Firebase(`${config.firebase.BaseURL}/requests`)
			.orderByChild('time_made')
			.startAt(Date.now());
		this.autoSync = true;
	}
}

export default Requests;
