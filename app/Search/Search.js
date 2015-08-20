import { Client } from 'elasticsearch';
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
			host : 'localhost:9200'
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
					formattedResults.push({
						index : {
							_index : index,
							_type : type,
							_id : individualResults[item].id
						}
					});

					formattedResults.push(
						individualResults[item]
					);
				}
			}

			this.es.bulk({
				body : formattedResults
			}, (err, resp) => {
				if(err){
					reject(err);
				} else {
					/* Refresh the index and give back the response */
					this.es.indices.refresh({
						index : index
					}, (err, resp) => {
						if(err){
							reject(err);
						} else {
							console.log('Refreshing');
							resolve(resp);
						}
					});
					
				}
			});

		});
	}

	query (searchTerm) {
		console.log('querying');
		return new Promise((resolve, reject) => {
			this.es.search({
				body: {
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
							},
							aggs: {
								'top-provider-hits': {
									'top-hits': {
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
					console.log('resolving' + response);
					resolve(response);
				}
			});
		});
	}
}

export default Search;