import * as Firebase from 'firebase';

var img = new Firebase('https://often-prod.firebaseio.com/queues/image_resizing/tasks');

img.once('value', (snap) => {
	var numLeft = snap.numChildren();
	console.log(numLeft);
});
