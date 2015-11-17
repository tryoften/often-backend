import 'backbonefire';
import _ from 'underscore';
import Backbone from 'backbone';
import Firebase from 'firebase';
import Feed from '../Models/Feed';
import { firebase as FirebaseConfig } from '../config';
import UserTokenGenerator from '../Auth/UserTokenGenerator';

class Feeds extends Backbone.Firebase.Collection {

	/**
	 * Initializes the feeds collection.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 * @param {Boolean} opts.queueEnabled - whether to enable the feed page parsing queue
	 *
	 * @return {void}
	 */
	initialize (models, opts = {}) {
		this.model = Feed;
		this.queueEnabled = opts.queueEnabled || false;
		this.url = UserTokenGenerator.getAdminReference(`${FirebaseConfig.BaseURL}/feeds`);
		this.autoSync = true;
	}

	/**
	 * passes options to the Feed models in the collection
	 */
	model (attrs, opts) {
		opts.queueEnabled = opts.queueEnabled || this.queueEnabled;
		return Feed(attrs, opts);
	}
	
	/**
	 * Returns name of all feeds
	 *
	 * @return {Promise} - Returns a promise that resolves to an array of strings containing feed names,
	 					or an error when rejected 
	 */
	getFeedNames () {
		return this.models.map(feedObj => { return feedObj.id; });
	}
}

export default Feeds;