import 'backbonefire';
import { Firebase } from 'backbone';
import ElasticSearchQuery from '../Models/ElasticSearchQuery';
import { firebase as FirebaseConfig } from '../config';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import { Queryable } from '../Interfaces/Queryable';

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
	generateQuery (query: Queryable, type: string): Object {

		if (this.models.length === 0) {
			throw new Error('The query collection is empty!');
		}

		var esQuery =  this.get(type);
		if (!esQuery) {
			throw new Error('No query defined for given type');
		}

		return esQuery.injectQuery(query);

	}

}

export default ElasticSearchQueries;
