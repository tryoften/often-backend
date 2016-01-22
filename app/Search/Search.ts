import {MediaItemGroup} from '../Models/MediaItemGroup';
import { Client } from 'elasticsearch';
import { elasticsearch as ElasticSearchConfig } from '../config';
import ElasticSearchQueries from '../Collections/ElasticSearchQueries';
import ElasticSearchQuerySettings from '../Models/ElasticSearchQuerySettings';
import * as _ from 'underscore';
import logger from '../Models/Logger';
import { Indexable } from '../Interfaces/Indexable';
import { Queryable } from '../Interfaces/Queryable';
import { IndexedObject } from '../Interfaces/Indexable';
import RequestType from '../Models/RequestType';

/**
 * Class for interacting with ElasticSearch.
 * Format:
 *	{index}/{type}/{id}, where:
 *  index: refers to a service provider ex. spotify
 *  type:  refers to kind of information obtained from the service provider ex. artist
 *  id:    uniquely identifies the document
 */
class Search {
	es: Client;
	esQueries: ElasticSearchQueries;
	esQuerySettings: ElasticSearchQuerySettings;


	/**
	 * Initializes the search instance.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	constructor (opts?: any) {
		this.es = new Client({
			host: ElasticSearchConfig.BaseURL
		});
		this.esQueries = new ElasticSearchQueries();
		this.esQuerySettings = new ElasticSearchQuerySettings();
	}

	/**
	 * Initializes the client request dispatcher.
	 * @param {string} index - name of index for elastic search ex. spotify
	 * @param {array} results - array of objects containing data to be indexed
	 *
	 * @return {Promise} - Promise resolving to a boolean indicating whether bulk indexing has been successful.
	 */
	index (indexables: IndexedObject[]) {
		console.log('indexing...');
		return new Promise((resolve, reject) => {

			/* Prepare the results to be indexed with ElasticSearch */
			var formattedResults: Object[] = [];
			for (let indexedObject of indexables) {
				formattedResults = formattedResults.concat(this.getIndexFormat(indexedObject));
			}

			this.es.bulk({
				body: formattedResults,
				refresh: true
			}, (err, resp) => {
				if (err) {
					console.log('Failed to index: ' + err);
					reject(err);
				} else {
					console.log('response');
					resolve(resp);
				}
			});

		});
	}

	/**
	 * Queries the search database with the given query
	 * @param {string} query - The search query
	 * @param {[string]} indices - Array of strings containing names of indices used for querying against Elasticsearch
	 *
	 * @return {Promise} - a promise resolving in an array of search results
	 */

	query (query: Queryable): Promise<MediaItemGroup[]> {

		var esQuery = this.esQueries.generateQuery(query, 'search');

		return new Promise((resolve, reject) => {

			this.es.search(esQuery,
				(error, response: any) => {
					if (error) {
						console.log('error' + error);
						reject(error);
					} else {

						let formattedResults = this.formatResults(response);

						resolve(formattedResults);

						this.updateSearchTerms(
							this.generateSearchId(query.text),
							query.text,
							response.hits.total
						);
					}

				});

		});
	}

	getIndexFormat (indexedObject: IndexedObject): Object {
		return [{
			'update' : {
				_index: indexedObject._index,
				_type: indexedObject._type,
				_id: indexedObject._id
			}
		},
		{
			'doc_as_upsert': true,
			doc: indexedObject
		}];
	}



	formatResults (rawResults: any): MediaItemGroup[] {
		var results: MediaItemGroup[] = [];
		for (let groupData of rawResults.aggregations['top-groups'].buckets) {
			var items = _.map(groupData.top_item_hits.hits.hits, (item: any) => { return item._source });
			var group = new MediaItemGroup(groupData.key, items);
			results.push(group);
		}
		return results;
	}

	updateSearchTerms(searchId: string, queryText: string, count: number) {

		// TODO(jakub): Move all ES statements to Firebase
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
					count: count
				},

				upsert: {
					text: queryText,
					suggest: {
						input: queryText,
						output : queryText,
						payload: {
							resultsCount: count,
							type: 'query'
						}
					},
					counter: 1,
					resultsCount: count 
				}
			}
		}, (error, response) => {
			console.log(error, response);
		});
	}

	/**
	 * returns a some search autocomplete suggestions for a given query
	 * @param {string} filter - filter containing process commands
	 * @param {string} query - The query to get results for
	 *
	 * @return {Promise} - a promise that resolves an array of the top results
	 */
	suggest (query: Queryable): Promise<any>  {
		logger.profile('Suggest ' + query);

		return new Promise((resolve, reject) => {
			this.es.suggest({
				index: 'search-terms',
				body: {
					'query-suggest': {
						text: query.text,
						completion: {
							field: 'suggest'
						}
					}
				}
			}, (error, response) => {
				if (error) {
					reject(error);
				} else {
					var result = response['query-suggest'][0];
					result.options = _.each(result.options, (item: any) => {
						item.type = item.payload.type;

						if (_.isUndefined(item.type) || _.isNull(item.type)) {
							item.type = 'query';
						}

						if (item.type === 'filter') {
							item.image = item.text.substring(1, item.text.length) + '-tag';
						}
						item.id = new Buffer(item.text).toString('base64');
						return item;
					});
					logger.profile('Suggest ' + query);
					resolve(response['query-suggest']);
				}
			});
		});
	}

	/**
	 * returns the current top searches on the platform
	 * @param {int} count - the number of results to return
	 *
	 * @return {Promise} - a promise that resolves an array of the top results
	 */ 
	getTopSearches (count = 10) {
		if(!_.isNumber(count)){
			count = 10;
		}
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
						counter: { order: 'desc' }
					}],
					size: count
				}
			}, (error, response: any) => {
				if (error) {
					reject(error);
				} else {
					resolve( parseData(response.hits.hits) );
				}
			});
		});
	}

	generateSearchId (str: string) {
		return new Buffer(str).toString('base64');
	}
}

export default Search;
