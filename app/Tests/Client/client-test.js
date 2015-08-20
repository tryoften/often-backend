var express = require('express');
var Firebase = require('firebase');
var ref = new Firebase('https://asterix.firebaseio.com');
var app = express();

app.get('/', function(req, res){
	var query = req.query.query;
	console.log(query);
	sendQuery(query);
});

function sendQuery(queryText) {
	var pushRef = ref.child('requests').push({
		query : queryText,
		time_made : Date.now(),
		user : '-JuXf23K7JyEzYBfXDSv'
	});
}

app.listen(7777, function() {
	console.log("Test is running.");
});