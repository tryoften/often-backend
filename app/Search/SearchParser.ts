import * as _ from 'underscore';

/**
 * This class is responsible for parsing out search filters / parameters
 */
class SearchParser {

	/**
	 * Parses a query string in order to obtain the filter, actual query, and feeds & service providers relevant to the query
	 * @param {string} rawQuery - query string that hasn't been parsed yet
	 *
	 * @return {Promise} - Returns a promise that when resolved contains relevant feeds, service providers, filter and actualQuery
	 						or an error when rejected. 
	 */
	parse (rawQuery) {
		
		var tokens = this.tokenize(rawQuery);
		var filter = tokens.filter;
		var actualQuery = tokens.actualQuery;
		var parsedContents = {
			filter : filter,
			actualQuery : actualQuery
		};
		
		return parsedContents;
	}

	/**
	 * Breaks the raw query into tokens
	 * @param {string} rawQuery - query string that hasn't been parsed yet
	 */
	tokenize (rawQuery) {

		if (_.isUndefined(rawQuery) || rawQuery.length === 0) {
			throw new Error('Invalid query');
		}

		var trimmedQuery = rawQuery.trim();
		var tokens: any = {};
		var filter, actualQuery;

		if (trimmedQuery[0] === '#') {
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
