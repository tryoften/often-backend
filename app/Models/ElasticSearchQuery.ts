import { Model } from 'backbone';
import * as _ from 'underscore';
import Query from "./Query";
/**
 * This class is responsible for providing granular functionalities (mostly accessors) for ElasticSearchQueries.
 */ 
class ElasticSearchQuery extends Model {

	/**
	 * Prepares query arguments by injecting text onto the query template and optionally overwrites the index
	 * @param {string} text - textual query
	 * @param {string} index - optional parameter containing index name for which the query will be called for
	 *
	 * @return {Promise} - Promise that resolves to an array containing header and body objects
	 */
	injectQuery (query: Query): Object {

		/* Perform a deep copy on an object */
		var paths = this.get("queryPaths");
		var header = this.get("header");

		/* Get the deep copy of the body since we don't want the changes to propagate to firebase */
		var body = JSON.parse(JSON.stringify(this.get("body")));

		for (let path of paths) {
			this.substituteQuery(body, path, query.text);
		}

		return {
			index: header.index,
			body: body
		};
	}

	/**
	 * Inserts queryText into the template at the specified queryPath
	 * @param {any} template - template of the query
	 * @param {string} path - dot delimited path of where the query parameter is
	 * @param {string} text - text of the query
	 *
	 * @return {void} 
	 */
	substituteQuery(template: any, path: string, text: string) {
    	var arr = path.split(".");
    	/* iteratively pop elements in arr from left to right, and use them as indices into the body of the query, 
    	   until the very last "query" key is reached  */
    	while(arr.length > 1 && (template = template[arr.shift()]));
    	template[arr[arr.length - 1]] = text;
    	
	}

}

export default ElasticSearchQuery;
