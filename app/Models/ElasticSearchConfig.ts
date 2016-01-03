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
	 *
	 * @return {void}
	 */
	initialize (attrs: any, opts: any) {
		this.url = UserTokenGenerator.getAdminReference(`${config.firebase.BaseURL}/config/elastic-search/query-settings`);
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
