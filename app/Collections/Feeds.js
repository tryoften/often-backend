import 'backbonefire';
import _ from 'underscore';
import Backbone from 'backbone';
import Firebase from 'firebase';
import Feed from '../Models/Feed';
import { firebase as FirebaseConfig } from '../config';

class Feeds extends Backbone.Firebase.Collection {

	/**
	 * Initializes the feeds collection.
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
	
	/**
	 * Returns name of all feeds
	 *
	 * @return {Promise} - Returns a promise that resolves to an array of strings containing feed names,
	 					or an error when rejected 
	 */
	getFeedNames () {
		return new Promise( (resolve, reject) => {
			this.once('sync', 
				syncedFeeds => {
					var feedNames = syncedFeeds.models.map(( feedObj ) => { return feedObj.id; });
					resolve(feedNames);
				}, 
				err => { reject(err); });
		});
	}
}

export default Feeds;