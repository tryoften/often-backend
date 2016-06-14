
import NotificationWorker from '../Workers/NotificationWorker';
let nw = new NotificationWorker();

let resolve = function(input) {
	console.log(input);
};

let reject = function(error) {
	console.error(error);
};

let task = {
	notificationId: 'tstNotification'
};

nw.process(task, null, resolve, reject);
