import * as rest from 'restler';
import Worker, { Task } from '../Worker';
import NotificationWorker, { NotificationTask } from './NotificationWorker';
import { Notification } from '@often/often-core';
import { firebase as FirebaseConfig } from '../../config';

export default class FirebaseNotificationWorker extends NotificationWorker {
	public process(task: NotificationTask, progress: Function, resolve: Function, reject: Function) {
		let notification = new Notification({id: task.notificationId});

		notification.syncModel().then(() => {
			let notificationHeader = {
				"Authorization": `key=${FirebaseConfig.Authorization}`,
				"Content-Type": "application/json"
			};

			let notificationBody = {
				to: `/topics/${notification.target}`,
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

			rest.post('https://fcm.googleapis.com/fcm/send', restlerOptions).on('complete', (result) => {
				if (result instanceof Error) {
					console.error(result);
					reject(`Error sending notification for notification id ${notification.id} with error ${result.message}`);
				} else {
					let message = 'Successfully pushed notification ' + notification.id;
					console.log(message, result);
					resolve(message);
				}
			});
		}).catch((error) => {
			reject(error);
		});
	}
}
