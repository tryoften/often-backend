import 'backbonefire';
import { Firebase } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import _ from 'underscore';
import UserTokenGenerator from '../Auth/UserTokenGenerator';

/**
 * This class is responsible for parsing out search filters / parameters
 */
class ElasticSearchQuerySettings extends Firebase.Model {

	/**
	 * Initializes the elastic search config model.
	 *
	 * @return {void}
	 */
	constructor () {

		let opts = {
			autoSync: true
		};
		super([], opts);
	}

	/**
	 * Initializes the recents collection.
	 * @param {string} models - optional models for backbone
	 * @param {string} opts - optional options for backbone
	 *
	 * @return {void}
	 */
	initialize (models, opts) {
		this.url = UserTokenGenerator.getAdminReference(`${FirebaseConfig.BaseURL}/config/elastic-search/query-settings`);
	}


	getResponseSize () {
		return new Promise( (resolve, reject) => {
			this.once("sync", () => {
				console.log(this.get("responseSize"));
				resolve(this.get("responseSize"));
			});
			this.fetch();
		});
	}
	

	
}

export default ElasticSearchQuerySettings;
