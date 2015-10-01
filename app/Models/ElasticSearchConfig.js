import 'backbonefire';
import { Firebase } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import _ from 'underscore';

/**
 * This class is responsible for parsing out search filters / parameters
 */
class ElastSearchConfig extends Firebase.Model {

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
		this.url = `${FirebaseConfig.BaseURL}/config/elastic-search`;
	}

	

	
}

export default ElastSearchConfig;
