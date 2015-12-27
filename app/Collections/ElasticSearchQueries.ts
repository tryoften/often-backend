import Firebase from 'backbonefire';
import * as _ from 'underscore';
import * as Backbone from 'backbone';
import ElasticSearchQuery from '../Models/ElasticSearchQuery';
import config from '../config';
import User from '../Models/User';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import Requests from "./Requests";
var FirebaseConfig = config.firebase;

class ElasticSearchQueries extends Firebase.Collection<ElasticSearchQuery> {

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
	 * @param {ElasticSearchQuery[]} models - optional models for backbone
	 * @param {string} opts - optional options for backbone
	 * @param {string} userId - user's id to load up favorties
	 *
	 * @return {void}
	 */
	initialize (models: ElasticSearchQuery[], opts: any) {
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
	generateQueries (text: string, index: string = "", type = "") {

		var requests: any[] = [];
		if (this.models.length === 0) {
			throw new Error("The query collection is empty!");
		}
		
		if (index !== "" && type !== "") {
			requests = this.get(type).injectQuery(text, index);
		} else {
			for (var model of this.models) {
				requests = requests.concat(model.injectQuery(text));
			}
		}

		return requests;
	}

}

export default ElasticSearchQueries;
