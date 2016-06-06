import { firebase as FirebaseConfig } from '../config';
import * as _ from 'underscore';
import Worker, { Task } from './Worker';


type UserId = string;
interface NotificationTask extends Task {
	notificationId: string;
	targets: UserId[];
	packId: string;
	timeCreated: Date;
	timeTargeted: Date;
}

class NotificationWorker extends Worker {

	constructor (opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.queues.notification);
		super(options);
	}

	public process (task: NotificationTask, progress: Function, resolve: Function, reject: Function) {

		processNotification.then(() => {

		}).then( (results) => {
			resolve(results);
		}).catch( (err: Error) => {
			reject(err);
		});
	}

	public processNotification(task: NotificationTask) {

		return new Promise( (resolve, reject) => {
			/* ... */
			let result = {};
			resolve(result);
		});
	}

}

export default NotificationWorker;
