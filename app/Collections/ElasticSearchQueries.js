import 'backbonefire';
import _ from 'underscore';
import Backbone from 'backbone';
import ElasticSearchQuery from '../Models/ElasticSearchQuery';
import { firebase as FirebaseConfig } from '../config';

class ElasticSearchQueries extends Backbone.Firebase.Collection {

	/**
	 * Initializes the elastic search queries.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	initialize (models, opts) {
		this.model = ElasticSearchQuery;
		this.url = `${FirebaseConfig.BaseURL}/config/elastic-search/queries`;
		this.autoSync = true;
	}

	/**
	 * Prepares a query string with a query object that can be passed into ElasticSearch for querying
	 * @param {string} queryText - textual query
	 * @param {string} index - optional parameter containing index information
	 * @param {string} queryType - type of query as defined in the configuration
	 *
	 * @return {Promise} - Promise that resolves to an array of header/body objects
	 */
	query (queryText, index = "", queryType = "") {
		return new Promise( (resolve, reject) => {

			this.once("sync", () => {
				var queryRequests = [];
				if(this.models.length === 0) throw new Error("The query collection is empty!");
				
				if (index !== "" && queryType !== "") {
					queryRequests = this.get(queryType).injectQuery(queryText, index);
				} else {
					for (var model of this.models) {
						queryRequests = queryRequests.concat(model.injectQuery(queryText));
					}
				}

				resolve(queryRequests);

			});

			this.fetch();

		});
		
	}

}

export default ElasticSearchQueries;