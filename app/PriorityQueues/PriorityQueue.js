import Queue from 'firebase-queue';
import Firebase from 'firebase';
import ClientRequestDispatcher from '../Services/ClientRequestDispatcher';
import { FirebaseConfig } from '../config';
import { FireQueueConfig } from '../config';
import _ from 'underscore';

/**
 * This class is responsible for setting up a priority queue to delegate work to workers
 */
class PriorityQueue {

	/**
	 * Initializes the priority queue.
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	constructor (opts = {}) {

		this.crd = new ClientRequestDispatcher();
		this.options = _.defaults(opts, {
			'numWorkers': FireQueueConfig.numWorkers,
			'sanitize':  FireQueueConfig.sanitize,
			'suppressStack':  FireQueueConfig.suppressStack,
			'url': `${FirebaseConfig.BaseURL}/queue`
		});

	}

	/**
	 * Sets up the worker callback and listens for incoming client requests
	 *
	 * @return {void}
	 */
	process () {
		this.ref = new Firebase(this.options.url);
		this.queue = new Queue(this.ref, this.options, (data, progress, resolve, reject) => {
			// Read and process task data
			console.log('starting ' + data.id);

			//returns a promise when all providers are resolved
			this.crd.process(data).then( (d) => {
				console.log('finished' + data.id);
				resolve();
			});
		});
	}
}

export default PriorityQueue;