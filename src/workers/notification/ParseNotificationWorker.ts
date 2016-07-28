import * as rest from 'restler';
import NotificationWorker, { NotificationTask } from './NotificationWorker';
import { Notification } from '@often/often-core';
import { parse as ParseConfig } from '../../config';
const Push = require("parse-push");

export class ParseNotificationWorker extends NotificationWorker {
	push: any;

	constructor(opts = {}) {
		super(opts);

		this.push = new Push({
			applicationId: ParseConfig.applicationId,
			restApiKey: ParseConfig.restApiKey
		});
	}

	public process(task: NotificationTask, progress: Function, resolve: Function, reject: Function) {
		let notification = new Notification({id: task.notificationId});

		notification.syncModel().then(() => {
			this.push.sendToChannels([notification.packId], {
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
		}).catch((error) => {
			reject(error);
		});
	}
}
