import Worker from './Worker';
import FeedPage from '../Models/FeedPage';
import * as _ from 'underscore';
import * as elasticsearch from 'elasticsearch';
import { elasticsearch as ElasticSearchConfig } from '../config';
import { firebase as FirebaseConfig } from '../config';
import logger from '../logger';
import { Client } from 'elasticsearch';

class FeedPageWorker extends Worker {
	search: Client;
	constructor (opts = {}) {
		let options = _.defaults(opts, {
			specId: 'feed_page_parsing',
			numWorkers: 1,
			url: FirebaseConfig.BaseURL + FirebaseConfig.queues.feed.url,
			suppressStack: true,
			sanitize: false
		});

		super(options);

		this.search = new elasticsearch.Client({
		  host: ElasticSearchConfig.BaseURL,
		  log: 'trace'
		});
	}

	process (data, progress, resolve, reject) {
		logger.info('FeedPageWorker(): owner-id: ', data._owner, ' pageURL: ', data.pageURL);
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
