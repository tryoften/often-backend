import elasticsearch from 'elasticsearch';
import Queue from 'firebase-queue';
import Firebase from 'firebase';
import sources from './sources';
import Feed from '../../Models/Feed';
import { elasticsearch as ElasticSearchConfig } from '../../config';

class FeedIngestor {

	constructor (opts) {
		this.feeds = [];
		this.search = new elasticsearch.Client({
		  host: ElasticSearchConfig.BaseURL,
		  log: 'trace'
		});

		for (let source of sources) {
			let feed = new Feed(source);
			feed.ingestor = this;
			this.feeds.push(feed);
		}
	}

	ingest (backfill = false) {
		for (let feed of this.feeds) {
			feed.processPages(backfill);
		}
	}
}

export default FeedIngestor;