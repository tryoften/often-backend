var Firebase = require('firebase');
var generateURI = require('../build/Utilities/generateURI').generateURIfromGuid;
var baseURL = "https://luc-dev.firebaseio.com/";

function testRandomQueries() {
	var randomQueries = [
		"lenny kravitz",
		"garfield",
		"plastic surgery",
		"90210",
		"michael jackson",
		"bill cosby drugs",
		"kanye humble",
		"50 cent instagram bashing",
		"lost ones",
		"cray white girl",
		"tinder saves relationship",
	];

	var responsesRef = {};
	var baseRef = new Firebase(baseURL);
	var ref = baseRef.child("queues/search/tasks");

	function checkResponse(query, snap) {

		if (snap.exists()) {
			responsesRef[snap.id] = snap.val();
			console.timeEnd("Query: " + query);
		}

		if (randomQueries.length == Object.keys(responsesRef).length) {
			console.log("all")
		}
	}

	for (var id in randomQueries) {
		var query = randomQueries[id];
		var queryId = generateURI(query);
		var responseRef = baseRef.child("responses/" + queryId);

		responseRef.on('value', checkResponse.bind(this, query));
		console.time("Query: " + query);
		ref.push({
			"id": queryId,
			"query": {
				"text":	query,
				"autocomplete": true
			}
		});
	}
}

for (var i = 0; i < 200; i++) {
	testRandomQueries();
}