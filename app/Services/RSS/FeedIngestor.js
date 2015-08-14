import elasticsearch from 'elasticsearch';
import sources from './sources';
import RSSFeed from '../../Models/RSSFeed';

class FeedIngestor {
	constructor () {
		this.feeds = [];
		this.search = new elasticsearch.Client({
		  host: 'localhost:9200',
		  log: 'trace'
		});

		for (let source of sources) {
			let feed = new RSSFeed(source);
			this.feeds.push(feed);
		}
	}

	ingest () {
		for (let feed of this.feeds) {
			feed.queueJobs();
		}
	}

	/**
		stores the rss feed item in elastic search and indexes it
	*/
	indexItemInSearchEngine(item) {
		this.search.create({
			'index': 'article',
			'id': item.guid,
			'type': 'rss',
			'body': item
		});
	}
}

var ingestor = new FeedIngestor();
ingestor.ingest();