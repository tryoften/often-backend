import ServiceProviders from '../Collections/ServiceProviders';
import Feeds from '../Collections/Feeds';
import _ from 'underscore';

/**
 * This class is responsible for parsing out search filters / parameters
 */
class SearchParser {

	/**
	 * Initializes the search parser
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	constructor (models, opts) {
		this.feeds = new Feeds();
		this.serviceProviders = new ServiceProviders();
		this.controlFilters = ['top-searches'];
	}

	/**
	 * Checks whether the passed in filter is one of control filters
	 * @param {string} filter
	 *
	 * @return {bool} - Returns true if the filter is a control filter or false otherwise
	 */
	isControlFilter (filter) {
		if(filter === 'undefined' || filter.length == 0) return false;
		return _.contains(this.controlFilters, filter);
	}

	/**
	 * Parses a query string in order to obtain the filter, actual query, and feeds & service providers relevant to the query
	 * @param {string} rawQuery - query string that hasn't been parsed yet
	 *
	 * @return {Promise} - Returns a promise that when resolved contains relevant feeds, service providers, filter and actualQuery
	 						or an error when rejected. 
	 */
	parse (rawQuery) {

		return new Promise((resolve, reject) => {

			/* load feeds */
			this.feeds.getFeedNames().then( feeds => {

				/* load service provicers */
				this.serviceProviders.getServiceProviderNames().then( serviceProviders => {

					var tokens = this.tokenize(rawQuery)
					var filter = tokens.filter;
					var actualQuery = tokens.actualQuery;
					var filteredFeeds, filteredProviders;

					if (filter.length > 0 && !this.isControlFilter(filter)) {
						filteredFeeds = this.filterSources(feeds, [ filter ]);		
						filteredProviders = this.filterSources(serviceProviders, [ filter ]);
									
					} else {
						/* no specific filters attached */
						filteredFeeds = feeds;
						filteredProviders = serviceProviders;
						
					}

					var parsedContents = {
						feeds : filteredFeeds,
						serviceProviders : filteredProviders,
						filter : filter,
						actualQuery : actualQuery
					}

					resolve(parsedContents);

				}).catch( err => reject(err));

			}).catch( err => reject(err));

		});

	}

	/**
	 * Filters out the sources that will be queried against ElasticSearch based on attached filters
	 * @param {[string]} sources - string array containing sources supported by the search system
	 * @param {[string]} filters - string array containing filters passed in from the client
	 *
	 * @return {[string]} - string array containing only sources that match passed-in filters
	 */
	filterSources (sources, filters) {

		return _.filter(sources, (sourceElement) => { 
			return _.contains(filters, sourceElement.split('-')[0]); 
		});
	}
	
	/**
	 * Breaks the raw query into tokens
	 * @param {string} rawQuery - query string that hasn't been parsed yet
	 *
	 * @return {Promise} - Returns a promise that when resolved contains the filter and actualQuery
	 						or an error when rejected. 
	 */
	tokenize (rawQuery) {

		if(rawQuery === 'undefined' || rawQuery.length  == 0) throw new Error('Invalid query');

		var trimmedQuery = rawQuery.trim();
		var tokens = {};
		var filter, actualQuery;

		if (trimmedQuery[0] == '#') {

			var firstWord = trimmedQuery.split(' ')[0];
			filter = firstWord.substring(1, firstWord.length);
			actualQuery = trimmedQuery.substring(filter.length + 2, trimmedQuery.length);
		} else {

			filter = '';
			actualQuery = trimmedQuery;
		}

		tokens.filter = filter;
		tokens.actualQuery = actualQuery;
		
		return tokens;

	}


	
}

export default SearchParser;
