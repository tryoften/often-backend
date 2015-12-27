import 'backbonefire';
import { Firebase } from 'backbone';
import config from '../config';
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
	initialize (attrs: any, opts: any) {
		this.url = UserTokenGenerator.getAdminReference(`${config.firebase.BaseURL}/config/elastic-search/query-settings`);
	}

	/**
	 * Returns the size of the response
	 *
	 * @return {int} - Size of the response
	 */
	getResponseSize () {
		return this.get("responseSize");
	}

	/**
	 * Returns the size of the response
	 *
	 * @return {int} - Size of the response
	 */
	getQueryType (index: number) {
		return this.get("sourceToQueryMap")[index];
	}

	
}

export default ElasticSearchQuerySettings;
