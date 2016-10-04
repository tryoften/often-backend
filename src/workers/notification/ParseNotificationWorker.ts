import * as rest from 'restler';
import NotificationWorker, { NotificationTask } from './NotificationWorker';
import { Notification } from '@often/often-core';
import { parse as ParseConfig } from '../../config';
const Push = require("parse-push");

export default class ParseNotificationWorker extends NotificationWorker {
	push: any;

	constructor(opts = {}) {
		super(opts);

		this.push = new Push(ParseConfig);
	}

	public process(task: NotificationTask, progress: Function, resolve: Function, reject: Function) {
		let notification = new Notification({id: task.notificationId});

		notification.syncModel().then(() => {
			this.push.sendToChannels([`p${notification.target}`], {
				aps: {
					badge: "Increment",
					alert: notification.text,
					sound: "default"
				},
				"content-available": 1
			}, function(error, data) {
				if (error) {
					let message = "Error: " + error.message;
					console.error(message);
					reject(message);
				} else {
					console.log("Notification Successfully delivered ", data);
					resolve(true);
				}
			});
		}).catch((error) => {
			reject(error);
		});
	}
}
