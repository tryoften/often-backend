var express = require('express');
var Firebase = require('firebase');
var ref = new Firebase('https://jakub-test.firebaseio.com/queue/tasks');
var app = express();

app.get('/', function(req, res){
	var query = req.query.query;
	console.log(query);
	sendQuery(query);
});

function sendQuery(queryText) {
	var pushRef = ref.push({
		id : queryText+':'+Date.now(),
		query : queryText,
		time_made : Date.now(),
		user : '-JuXf23K7JyEzYBfXDSv'
	});
}

app.listen(7777, function() {
	console.log("Test is running.");
});