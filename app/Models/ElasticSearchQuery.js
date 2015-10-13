import { Model } from 'backbone';
import _ from 'underscore';
/**
 * This class is responsible for providing granular functionalities (mostly accessors) for ElasticSearchQueries.
 */ 
class ElasticSearchQuery extends Model {
	
	/**
	 * Prepares query arguments by injecting queryText onto the query template and optionally overwrites the index
	 * @param {string} queryText - textual query
	 * @param {string} index - optional parameter containing index name for which the query will be called for
	 *
	 * @return {Promise} - Promise that resolves to an array containing header and body objects
	 */
	injectQuery (queryText, index = "") {		

		/* Perform a deep copy on an object */
		var queryPaths = this.get("queryPaths");
		var header = this.get("header");

		/* Get the deep copy of the body since we don't want the changes to propagate to firebase */
		var body = JSON.parse(JSON.stringify(this.get("body")));

		for (let path of queryPaths) {
			this.substituteQuery(body, path, queryText);
		}

		if (index !== "") {
			/* if an index is defined, then header's index needs to be set */
			header.index = index;
		}
		return [header, body];
	}

	/**
	 * Inserts queryText into the template at the specified queryPath
	 * @param {string} queryTemplate - template of the query
	 * @param {string} queryPath - dot delimited path of where the query parameter is
	 * @param {string} queryText - text of the query
	 *
	 * @return {void} 
	 */
	substituteQuery(queryTemplate, queryPath, queryText) {
    	var arr = queryPath.split(".");
    	while(arr.length > 1 && (queryTemplate = queryTemplate[arr.shift()]));
    	queryTemplate[arr[arr.length - 1]] = queryText;
    	
	}

}

export default ElasticSearchQuery;