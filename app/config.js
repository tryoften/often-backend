var path = require('path');
var args = require('minimist')(process.argv.slice(2));
var env_config = require('konfig')({path: './configs'}).app;

// Have to figure out a way to do this in JSON file
var config = env_config;

// When ENV vars are empty they overwrite defaults in JSON, put it here for now
if (process.env.PORT) {
	config.port = process.env.PORT;
}

if (process.env.LOG_PATH) {
	config.logPath = process.env.LOG_PATH;
}

if (process.env.OAUTH2_CALLBACK) {
	config.oauth2.redirectUrl = process.env.OAUTH2_CALLBACK;
}

if (args['firebase-root']) {
	config.firebase.BaseURL = args['firebase-root'];
}

if (args['elasticsearch-root']) {
	config.elasticsearch.BaseURL = args['elasticsearch-root'];
}

// No way to re-use host URL in JSON
var queues = Object.keys(config.firebase.queues);
queues.forEach(function(queue) {
	if (config.firebase.queues[queue].path) {
		config.firebase.queues[queue].url = config.firebase.BaseURL + config.firebase.queues[queue].path;
		delete config.firebase.queues[queue].path;
	}
});

module.exports = config;
