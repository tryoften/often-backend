import { Client } from 'elasticsearch';
import { ElasticSearchConfig } from '../config';

/**
 * Class for interacting with ElasticSearch.
 * Format:
 *	{index}/{type}/{id}, where:
 *  index: refers to a service provider ex. spotify
 *  type:  refers to kind of information obtained from the service provider ex. artist
 *  id:    uniquely identifies the document
 */
class Search {

	/**
	 * Initializes the search instance.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	constructor (models, opts) {
		this.es = new Client({
			host: ElasticSearchConfig.BaseURL,
			log: 'trace'
		});
	}

	/**
	 * Initializes the client request dispatcher.
	 * @param {string} index - name of index for elastic search ex. spotify
	 * @param {array} results - array of objects containing data to be indexed
	 *
	 * @return {Promise} - Promise resolving to a boolean indicating whether bulk indexing has been successful.
	 */
	index (index, results) {

		return new Promise((resolve, reject) => {

			/* Prepare the results to be indexed with ElasticSearch */
			var formattedResults = [];
			for (let type in results) {
				let individualResults = results[type];
				for (let item in individualResults) {

					/* Put action in */
					formattedResults.push({
						index : {
							_index : index,
							_type : type,
							_id : individualResults[item].id
						}
					});
					
					/* Put data in */
					formattedResults.push(
						individualResults[item]
					);
				}
			}

			this.es.bulk({
				body : formattedResults
			}, (err, resp) => {
				if(err){
					console.log('Failed to index: ' + err);
					reject(err);
				} else {
					/* Refresh the index and give back the response */
					this.es.indices.refresh({
						index : index
					}, (err, resp) => {
						if(err){
							reject(err);
						} else {
							resolve(resp);
						}
					});
					
				}
			});

		});
	}

	query (searchTerm) {

		return new Promise((resolve, reject) => {
			this.es.search({
				body: {
					/* limits the size of "hits" to 0, 
					 since the data is not accessed directly, 
					 but rather via aggregations */
					size: 0,
					query: {
						match: {
							'_all': searchTerm
						}
					},
					aggs: {
						'top-providers': {
							terms: {
								field: '_index',
								size: 10
							}, aggs: {
								'top-provider-hits': {
									'top_hits': {
										size : 2
									}
								}
							}
						}
					}
				}
			}, (error, response) => {
				if(error){
					console.log('error' + error);
					reject(error);
				} else {
					//console.log('resolving' + response);
					resolve(response);
				}
			});
		});
	}
}

export default Search;