import * as Firebase from 'firebase';

var img = new Firebase('https://often-prod.firebaseio.com/queues/elastic_dump_file/tasks');

img.once('value', (snap) => {
	var numLeft = snap.numChildren();
	console.log(numLeft);
});
