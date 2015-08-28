import Queue from 'firebase-queue';
import Firebase from 'firebase';
import ClientRequestDispatcher from '../Services/ClientRequestDispatcher';
import { FirebaseConfig } from '../config';
import { FireQueueConfig } from '../config';
/**
 * This class is responsible for setting up a priority queue to delegate work to workers
 */
class PriorityQueue {

	/**
	 * Initializes the priority queue.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	constructor (models, opts) {

		this.crd = new ClientRequestDispatcher();

	}

	/**
	 * Sets up the worker callback and listens for incoming client requests
	 *
	 * @return {void}
	 */
	process () {
		var ref = new Firebase(`${FirebaseConfig.BaseURL}/queue`);
		var options = {
			'numWorkers': FireQueueConfig.numWorkers,
			'sanitize':  FireQueueConfig.sanitize,
			'suppressStack':  FireQueueConfig.suppressStack
		};
		var queue = new Queue(ref, options, (data, progress, resolve, reject) => {
			// Read and process task data
			console.log('starting ' + data.id);

			//returns a promise when all providers are resolved
			this.crd.process(data).then((d)=>{
				console.log('finished' + data.id);
				resolve();
			});

		});
	}
}

export default PriorityQueue;