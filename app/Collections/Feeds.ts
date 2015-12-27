import 'backbonefire';
import * as _ from 'underscore';
import Firebase from 'backbonefire';
import Feed from '../Models/Feed';
import config from '../config';
import UserTokenGenerator from '../Auth/UserTokenGenerator';

class Feeds extends Firebase.Collection<Feed> {
	queueEnabled: Boolean;

	/**
	 * Initializes the feeds collection.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 * @param {Boolean} opts.queueEnabled - whether to enable the feed page parsing queue
	 *
	 * @return {void}
	 */
	initialize (models: Feed[], opts: any = {}) {
		this.model = Feed;
		this.queueEnabled = opts.queueEnabled || false;
		this.url = UserTokenGenerator.getAdminReference(`${config.firebase.BaseURL}/feeds`);
		this.autoSync = true;
	}

	/**
	 * passes options to the Feed models in the collection
	 */
	//model (attrs: any, opts: any) {
	//	opts.queueEnabled = opts.queueEnabled || this.queueEnabled;
	//	return new Feed(attrs, opts);
	//}
	
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
