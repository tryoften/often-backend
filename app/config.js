var path = require('path');
var args = require('minimist')(process.argv.slice(2));
var env_config = require('konfig')({path: './configs'}).app;

// Have to figure out a way to do this in JSON file
var config = env_config;

var queues = Object.keys(config.firebase.queues);
queues.forEach(function(queue) {
  if (config.firebase.queues[queue].path)
    config.firebase.queues[queue].url = config.firebase.BaseURL + config.firebase.queues[queue].path;
});

module.exports = config;
