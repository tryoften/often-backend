import elasticsearch from 'elasticsearch';
import sources from './sources';
import RSSFeed from '../../Models/RSSFeed';
import { ElasticSearchConfig } from '../../config';

class FeedIngestor {
	constructor () {
		this.feeds = [];
		this.search = new elasticsearch.Client({
		  host: ElasticSearchConfig.BaseURL,
		  log: 'trace'
		});

		for (let source of sources) {
			let feed = new RSSFeed(source);
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

var ingestor = new FeedIngestor();
ingestor.ingest(true);

export default FeedIngestor;