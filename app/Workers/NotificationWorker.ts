import * as _ from 'underscore';
import * as rest from 'restler';
import { firebase as FirebaseConfig, parse as ParseConfig } from '../config';
import Worker, { Task } from './Worker';
import Notification from '../Models/Notification';

var Push = require("parse-push");
var push = new Push({
	applicationId: ParseConfig.applicationId,
	restApiKey: ParseConfig.restApiKey
});

type UserId = string;

export interface NotificationTask extends Task {
	notificationId: string;
}

export default class NotificationWorker extends Worker {
	constructor(opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.queues.notification);
		super(options);
	}

	public process(task: NotificationTask, progress: Function, resolve: Function, reject: Function) {
		let firebaseOn = true;
		let notification = new Notification({id: task.notificationId});
		console.log(FirebaseConfig.Secret);
		notification.syncModel().then(() => {
			switch (firebaseOn) {
				case false:
					push.sendToChannels([`${notification.packId}`], {
						aps: {
							badge: "Increment",
							alert: `${notification.text}`,
							sound: "default"
						},
						"content-available": 1
					}, function(error, data) {
						if (error) {
							console.error("Error: " + error.message);
						} else {
							console.log("Notification Successfully delivered ", data);
						}
					});
					break;
				case true:
					let notificationHeader = {
						"Authorization": `key=${FirebaseConfig.Authorization}`,
						"Content-Type": "application/json"
					};

					let notificationBody = {
						to: `/topics/${notification.packId}`,
						notification: {
							title: notification.title,
							body: notification.text,
							badge: "1"
						},
						data: {
							p: notification.packId
						},
						priority: 10
					};

					let restlerOptions = {
						headers: notificationHeader,
						data: JSON.stringify(notificationBody)
					};

					console.log(JSON.stringify(notificationHeader));

					// send http request for push notification
					rest.post('https://fcm.googleapis.com/fcm/send', restlerOptions).on('complete', function(result) {
						if (result instanceof Error) {
							reject(`Error sending notification for notification id ${notification.id} with error ${result.message}`);
						} else {
							console.log(result);
							resolve('Successfully pushed notification', notification.id);
						}
					});
					break;
			}
		}).catch((error) => {
			reject(error);
		});
	}

	setupHealthCheckServer() {
		console.log('health check server');
	}
}
