import 'backbonefire';
import _ from 'underscore';
import Backbone from 'backbone';
import ElasticSearchQuery from '../Models/ElasticSearchQuery';
import { firebase as FirebaseConfig } from '../config';
import User from '../Models/User';
import UserTokenGenerator from '../Auth/UserTokenGenerator';

class ElasticSearchQueries extends Backbone.Firebase.Collection {

	/**
	 * Constructs the ElasticSearchQueries collection.
	 *
	 * @return {void}
	 */
	 constructor () {
		let opts = {
			model: ElasticSearchQuery,
			autoSync: true
		};
		super([], opts);
	}

	/**
	 * Initializes the favorites collection.
	 * @param {string} models - optional models for backbone
	 * @param {string} opts - optional options for backbone
	 * @param {string} userId - user's id to load up favorties
	 *
	 * @return {void}
	 */
	initialize (models, opts, userId) {
		this.url = UserTokenGenerator.getAdminReference(`${FirebaseConfig.BaseURL}/config/elastic-search/queries`);
	}

	/**
	 * Prepares a query string with a query object that can be passed into ElasticSearch for querying
	 * @param {string} text - textual query
	 * @param {string} index - optional parameter containing index information
	 * @param {string} type - type of query as defined in the configuration
	 *
	 * @return {Promise} - Promise that resolves to an array of header/body objects
	 */
	query (text, index = "", type = "") {
		return new Promise( (resolve, reject) => {

			this.once("sync", () => {
				var requests = [];
				if(this.models.length === 0) throw new Error("The query collection is empty!");
				
				if (index !== "" && type !== "") {
					requests = this.get(type).injectQuery(text, index);
				} else {
					for (var model of this.models) {
						requests = requests.concat(model.injectQuery(text));
					}
				}

				resolve(requests);

			});

			this.fetch();

		});
		
	}

}

export default ElasticSearchQueries;