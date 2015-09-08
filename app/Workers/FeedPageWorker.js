import Worker from './worker';
import FeedPage from '../Models/FeedPage';
import _ from 'underscore';
import { FirebaseConfig } from '../config';

class FeedPageWorker extends Worker {
	
	constructor (opts = {}) {
		let options = _.defaults(opts, {
			numWorkers: 3,
			url: FirebaseConfig.queues.feed
		});

		super(options);
	}

	process (data, progress, resolve, reject) {
		let page = new FeedPage(data);
		page.request()
			.then((data) => {
				resolve(data);
			})
			.fail((err) => {
				reject(err);
			});
	}
}