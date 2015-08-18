<<<<<<< HEAD
var express = require('../../../node_modules/express');
var Firebase = require('../../../node_modules/firebase');
var ref = new Firebase('https://asterix.firebaseio.com');
var app = express();
<<<<<<< Updated upstream

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

=======
>>>>>>> Stashed changes
=======
>>>>>>> master

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