import Queue from 'firebase-queue';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import { firebase as FirebaseConfig } from '../config';
import _ from 'underscore';

/**
 * This class is responsible for setting up a priority queue to delegate work to workers
 */
class Worker {

	/**
	 * Initializes the priority queue.
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	constructor (opts = {}) {
		this.options = _.defaults(opts, FirebaseConfig.queues.default);
	}

	/**
	 * Sets up the worker callback and listens for incoming client requests
	 *
	 * @return {void}
	 */
	start () {
		this.ref = UserTokenGenerator.getAdminReference(this.options.url);
		this.queue = new Queue(this.ref, this.options, this.process.bind(this));
	}

	/**
	 * Processes jobs
	 */
	process(data, progress, resolve, reject) {
		throw new Error('Worker(): worker.process must be implemented by a child class');
	}
}

export default Worker;