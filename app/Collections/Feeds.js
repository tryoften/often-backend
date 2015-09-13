import Backbone from 'backbone';
import Firebase from 'firebase';
import Feed from '../Models/Feed';
import { firebase as FirebaseConfig } from '../config';

class Feeds extends Backbone.Firebase.Collection {

	/**
	 * Initializes the requests collection.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	initialize (models, opts) {
		this.model = Feed;
		this.url = new Firebase(`${FirebaseConfig.BaseURL}/feeds`);
		this.autoSync = true;
	}
}

export default Feeds;