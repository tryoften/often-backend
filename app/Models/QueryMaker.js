import 'backbonefire';
import _ from 'underscore';
import ElasticSearchConfig from '../Models/ElasticSearchConfig';

/**
 * This class is responsible for creating a query string based on the Elasticsearch config
 */
class QueryMaker {

	/**
	 * Constructs the QueryMaker
	 *
	 * @return {void}
	 */
	constructor () {
		this.feeds = {};
		this.serviceProviders = {};
		this.resultSize = 10; //default overwritten by firebase value
		this.esConfig = new ElasticSearchConfig();
		this.setupEventListeners();

	}

	/**
	 * Sets up the even listeners for changes on the ElasticSearchConfig
	 *
	 * @return {void}
	 */
	setupEventListeners () {
		console.log('Setting up event listeners.');

		this.esConfig.on('change', (newESSettings) => {
			console.log("New settings detected. Updating.");
			var querySettings = newESSettings.get('query-settings');
			this.parseSettings(querySettings);
		});

	}
	
	/**
	 * Prepares the query string
	 * @param {[string]} searchIndices - list of string containing a list of indices to be searched against in the "match" clause
	 * @param {object} match - object containing match components
	 * @param {object / string} noMatch - either an object that contains a clause run against indices that do not match the indices,
	 			specified in the "indices" argument or a string "none", indicating that the query does not contan a no match query.
	 *
	 * @return {object} -- returns prepared query object
	 */
	prepareQueryObject (searchIndices, match, noMatch ) {

		return {
			size : this.resultSize,
			query : {
				indices : {
					indices : searchIndices,
					query : match,
					no_match_query : noMatch
				}
			}
		}

	}

	/**
	 * Prepares the match object
	 * @param {string} queryText - text of the query
	 * @param {string} type - type of query (ex. cross-fields)
	 * @param {[string]} fields - array of strings describing fields to be matched by the query
	 *
	 * @return {object} -- returns prepared match object
	 */
	prepareMatchObject (queryText, type, fields) {
		return {
			multi_match : {
				query : queryText,
				type : type,
				fields : fields
			}
		}

	}

	/**
	 * Wraps query object with a functionScore
	 * @param {object} query - object containing query information
	 * @param {object} functionScore - object containing information about functions defined in the elasticSearchConfig
	 *
	 * @return {object} -- returns an object containing function wrapped query object
	 */
	attachFunctionsToQuery (query, functionScore) {
		var fsObj = {};
		fsObj.function_score = {};
		fsObj.function_score.functions = functionScore.functions;
		fsObj.function_score.query = query;
		fsObj.function_score.score_mode = functionScore.score_mode;
		return fsObj;

	}

	/**
	 * Creates a query object ready to be queried against ElasticSearch
	 * @param {string} queryText - text of query
	 * @param {[string]]} userFeedIndices - array of strings containing names of feed indices
	 * @param {[string]]} userServiceProviderIndices - array of strings containing names of feed indices
	 *
	 * @return {object} -- returns a query object
	 */
	formQuery (queryText, userFeedIndices, userServiceProviderIndices) {
		var filteredFeedIndices = _.intersection(this.feeds.indices, userFeedIndices);
		var filteredSPIndices = _.intersection(this.serviceProviders.indices, userServiceProviderIndices);

		var serializedFeedFields = this.serializeFields(this.feeds.fields);
		var serializedSPFields = this.serializeFields(this.serviceProviders.fields);

		var feedMatchObject = this.prepareMatchObject(queryText, "most_fields", serializedFeedFields);
		var spMatchObject = this.prepareMatchObject(queryText, "cross_fields", serializedSPFields);

		var feedFinalObject = (typeof this.feeds.function_score === "undefined" ) ? 
			feedMatchObject : this.attachFunctionsToQuery(feedMatchObject, this.feeds.function_score);

		var spFinalObject = (typeof this.serviceProviders.function_score === "undefined" ) ? 
			spMatchObject : this.attachFunctionsToQuery(feedMatchObject, this.serviceProviders.function_score);

		var query;
		if (filteredSPIndices.length == 0 && filteredFeedIndices.length == 0) {
			return undefined;

		} else if (filteredSPIndices.length > 0 && filteredFeedIndices.length == 0) {
			query = this.prepareQueryObject(filteredSPIndices, spFinalObject, "none");

		} else if (filteredSPIndices.length == 0 && filteredFeedIndices.length > 0) {
			query = this.prepareQueryObject(filteredFeedIndices, feedFinalObject, "none");

		} else {
			query = this.prepareQueryObject(filteredSPIndices, spFinalObject, feedFinalObject);

		}
		return query;

	}

	/**
	 * Takes fields specified in ElasticSearchConfig and formats them to support querying by ElasticSearch
	 * @param {object} fields - object containing field data
	 *
	 * @return {object} -- returns a properly formatted fields object
	 */
	serializeFields (fields) {
		var serializedFields = []
		for (let f in Object.keys(fields)) {
			let type = fields[f].type;
			let attr = fields[f].attr;
			let boost = fields[f].boost;
			serializedFields.push(type + "." + attr + "^" + boost);
		}
		return serializedFields;
	}

	/**
	 * Returns a query object to be queried against ElasticSearch
	 * @param {string} queryText - text of query
	 * @param {[string]]} userFeedIndices - array of strings containing names of feed indices
	 * @param {[string]]} userServiceProviderIndices - array of strings containing names of feed indices
	 *
	 * @return {object} -- returns a query object
	 */
	generateQuery (queryText, userFeedIndices, userServiceProviderIndices) {
		var query;
		return new Promise ( (resolve, reject) => {

			if (_.isEmpty(this.feeds) || _.isEmpty(this.serviceProviders)) {
				
				/* force initialize the feeds and serviceProviders settings data if it hasn't been initalized yet by the real-time model */
				this.initQuerySettings().then( () => {
					query = this.formQuery(queryText, userFeedIndices, userServiceProviderIndices);
					(typeof query === "undefined") ? reject(query) : resolve(query);
					
				}).catch( err => {
					reject(err);

				});

			} else {
				query = this.formQuery(queryText, userFeedIndices, userServiceProviderIndices);
				resolve(query);

			}

		});

	}

	/**
	 * Initializes query settings
	 *
	 * @return {Promise} -- Promise that when resolved, returns true.
	 */
	initQuerySettings () {
		return new Promise( (resolve, reject) => {
			this.esConfig.once('sync', (syncedESSettings) => {
				var querySettings = syncedESSettings.get('query-settings');
				this.parseSettings(querySettings);
				resolve(true);
			});
		});

	}

	/**
	 * Parses query settings
	 * @param {object} querySettings - object containing raw query settings object
	 *
	 * @return {void}
	 */
	parseSettings (querySettings) {
		this.resultSize = querySettings.size;
		this.extractSetting(querySettings['service-providers'], this.serviceProviders);
		this.extractSetting(querySettings['feeds'], this.feeds);
	}

	/**
	 * Extracts indices, fields, function_score from setting and stores them at the passed-in source
	 * @param {object} setting - object representing a raw setting
	 * @param {object} source - object represting a class attribute source
	 *
	 * @return {void}
	 */
	extractSetting (setting, source) {
		source.indices = setting.indices;
		source.fields = this.parseFields(setting.fields);
		source.function_score = (typeof setting.function_score === "undefined") ? undefined : this.parseFunctions(setting.function_score);
	}

	/**
	 * Parses function settings and returns an appropriate functionScore object
	 * @param {object} functionSettings - raw function settings
	 *
	 * @return {object} -- Object containing serialized function score
	 */
	parseFunctions(functionSettings){
		var functions = [];
		var function_score = {};
		function_score.score_mode = functionSettings.score_mode;

		for (let funcContents of functionSettings.functions) {
			var funcType = Object.keys(funcContents)[0];
			var funcValues = funcContents[funcType];
			var tempObj = {};
			tempObj[funcType] = {};
			tempObj[funcType][funcValues.type + "." + funcValues.field] = funcValues.parameters;
			functions.push(tempObj);

		}
		function_score.functions = functions;
		return function_score;

	}
	/**
	 * Parses fields defined in setting
	 * @param {object} fields - raw fields settings
	 *
	 * @return {object} -- Parsed fields
	 */
	parseFields (fields) {
		var parsedFields = [];
		for (let type of Object.keys(fields)) {	
			var props = fields[type];

			for (let attr of Object.keys(props)) {
				parsedFields.push({
					type : type,
					attr : attr,
					boost : props[attr]
				});

			}
		}
		return parsedFields;

	}
	
}

export default QueryMaker;
