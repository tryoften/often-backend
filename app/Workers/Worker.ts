import Queue = require('firebase-queue');
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import { firebase as FirebaseConfig, port } from '../config';
import * as _ from 'underscore';
import { createServer } from 'http';

/**
 * Internal Firebase queue task
 */
export interface Task {
	_state: string;
	_state_changed: string;
	_owner: string;
	_progress: number;
	_error_details?: any;
}

/**
 * This class is responsible for setting up a priority queue to delegate work to workers
 */
class Worker {
	options: any;
	ref: any;
	queue: Queue;

	/**
	 * Initializes the priority queue.
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	constructor (opts = {}) {
		this.options = _.defaults(opts, FirebaseConfig.BaseURL + FirebaseConfig.queues.default);
	}

	/**
	 * Sets up the worker callback and listens for incoming client requests
	 *
	 * @return {void}
	 */
	start () {
		this.ref = UserTokenGenerator.getAdminReference(this.options.url);
		this.queue = new Queue(this.ref, this.options, this.process.bind(this));
		this.setupHealthCheckServer();
	}

	/**
	 * Processes jobs
	 */
	process(data: Task, progress: Function, resolve: Function, reject: Function): void {
		throw new Error('Worker.process(): worker.process must be implemented by a child class');
	}

	setupHealthCheckServer () {
		createServer((req, res) => {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('Health checker\n');
		}).listen(port);

		console.log(`Health check server running at http://127.0.0.1:${port}/`);
	}
}

export default Worker;
