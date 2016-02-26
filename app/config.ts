const config = require('config');

var args = require('minimist')(process.argv.slice(2));
config.worker = (function() {
	if (args._.length > 0) {
			return args._[0];
		}
	return 'not-set';
})();

export default config;
export var trackSchedulerOptions = config.trackSchedulerOptions;
export var firebase = config.firebase;
export var winston = config.winston;
export var elasticsearch = config.elasticsearch;
export var url_redirector = config.url_redirector;
export var url_shortener = config.url_shortener;
export var gcloud = config.gcloud;
export var port = config.port;
