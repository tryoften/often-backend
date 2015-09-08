import { Client } from 'elasticsearch';
import { elasticsearch as ElasticSearchConfig } from '../config';

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
			host: ElasticSearchConfig.BaseURL
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
				body: formattedResults,
				refresh: true
			}, (err, resp) => {
				if (err) {
					console.log('Failed to index: ' + err);
					reject(err);
				} else {
					resolve(resp);					
				}
			});

		});
	}

	/**
	 * Queries the search database with the given query
	 * @param {string} query - The search query
	 *
	 * @return {Promise} - a promise resolving in an array of search results
	 */
	query (query, autocomplete = false) {

		var command;
		if ( (command = this.processCommands(query)) ) {
			return command;
		}

		return new Promise((resolve, reject) => {

			let searchId = new Buffer(query).toString('base64');

			this.es.search({
				body: {
					/* limits the size of "hits" to 0, 
					 since the data is not accessed directly, 
					 but rather via aggregations */
					size: 0,
					query: {
						match: {
							'_all': query
						}
					},
					aggs: {
						'top-providers': {
							terms: {
								field: '_index'
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
				if (error) {
					console.log('error' + error);
					reject(error);
				} else {
					let results = this.serializeAndSortResults(response);
					resolve(results);

					// index search term for autocompletion
					this.es.update({
						index: 'search-terms',
						type: 'query',
						id: searchId,
						body: {
							script: `ctx._source.counter += 1; 
								ctx._source.resultsCount = count;
								ctx._source.suggest.payload = [:];
								ctx._source.suggest.payload['resultsCount'] = count;`,

							params: {
								count: results.length
							},

							upsert: {
								text: query,
								suggest: {
									input: query,
									payload: {
										resultsCount: results.length
									}
								},
								counter: 1,
								resultsCount: results.length
							}
						}
					});
				}
			});
		});
	}

	/**
	 * returns a some search autocomplete suggestions for a given query
	 * @param {string} query - The query to get results for
	 *
	 * @return {Promise} - a promise that resolves an array of the top results
	 */
	suggest (query) {

		var command;
		if ( (command = this.processCommands(query)) ) {
			return command;
		}

		return new Promise((resolve, reject) => {
			this.es.suggest({
				index: 'search-terms',
				body: {
					'query-suggest': {
						text: query,
						completion: {
							field: 'suggest'
						}
					}
				}
			}, (error, response) => {
				if (error) {
					reject(error);
				} else {
					resolve(response['query-suggest']);
				}
			});
		});
	}

	processCommands(query) {
		if (query.substring(0, 13) === '#top-searches') {
			return this.getTopSearches();
		}
		return false;
	}

	/**
	 * returns the current top searches on the platform
	 * @param {int} count - the number of results to return
	 *
	 * @return {Promise} - a promise that resolves an array of the top results
	 */ 
	getTopSearches (count = 10) {

		let parseData = (data) => {
			var results = [];

			for (let item of data) {
				results.push({
					id: item._id,
					text: item._source.text,
					counter: item._source.counter,
					type: item._type,
					index: item._index,
					payload: item._source.suggest.payload
				});
			}

			return [
				{
					text: `#top-searches:${count}`,
					options: results
				}
			];
		};

		return new Promise((resolve, reject) => {
			this.es.search({
				body: {
					sort: [{
						counter: { order: "desc" }
					}],
					size: count
				}
			}, (error, response) => {
				if (error) {
					reject(error);
				} else {
					resolve( parseData(response.hits.hits) );
				}
			});
		});
	}

	/**
	 * Creates a formatted results array using data returned from search and sorts it using the score.
	 * @param {object} data - object containing data from search
	 *
	 * @return {[object]} - array of objects
	 */
	serializeAndSortResults (data) {
		var results = [];
		let buckets = data.aggregations['top-providers'].buckets;

		for (let i in buckets) {
			var indResults = buckets[i]['top-provider-hits'].hits.hits;

			for (let j in indResults) {
				var singleResult = {
					'_index' : indResults[j]._index,
					'_type' : indResults[j]._type,
					'_score' : indResults[j]._score,
					'_id' : indResults[j]._id
				};

				var source = indResults[j]._source;
				for (let k in source) {
					singleResult[k] = source[k];
				}
				results.push(singleResult);
			}
		}

		//sort array by score
		results.sort( (a,b) => {
			return b._score - a._score;
		});

		return results;
	}	
}

export default Search;