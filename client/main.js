var unique = require('uniq');
var data = [1, 2, 2, 4];

var logger = function() {
	console.log(unique(data));
}

module.exports = logger;