import * as _ from 'underscore';
import * as rest from 'restler';
import { firebase as FirebaseConfig, parse as ParseConfig } from '../../config';
import Worker, { Task } from '../Worker';
import { Notification } from '@often/often-core';
import { production as prodApp } from '../../db';

type UserId = string;

export interface NotificationTask extends Task {
	notificationId: string;
}

export default class NotificationWorker extends Worker {
	constructor(opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.queues.notification);
		super(options);
	}

	setupHealthCheckServer() {
		console.log('health check server');
	}
}
