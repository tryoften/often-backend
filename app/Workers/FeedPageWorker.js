import Worker from './worker';
import FeedPage from '../Models/FeedPage';
import _ from 'underscore';
import elasticsearch from 'elasticsearch';
import { elasticsearch as ElasticSearchConfig } from '../config';
import { firebase as FirebaseConfig } from '../config';

class FeedPageWorker extends Worker {
	
	constructor (opts = {}) {
		let options = _.defaults(opts, {
			specId: 'feed_page_parsing',
			numWorkers: 3,
			url: FirebaseConfig.queues.feed.url,
			suppressStack: false
		});

		super(options);

		this.search = new elasticsearch.Client({
		  host: ElasticSearchConfig.BaseURL,
		  log: 'trace'
		});
	}

	process (data, progress, resolve, reject) {
		data.search = this.search;
		let page = new FeedPage(data);
		page.request()
			.then(data => {
				resolve(data);
			})
			.catch(err => {
				reject(err);
			});
	}
}

export default FeedPageWorker;