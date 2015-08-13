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
			feed.request(feed.url, (err, items) => {
				for (let item of items) {
					// console.log("item: ", item);
					this.search.create({
						'index': 'article',
						'id': item.guid,
						'type': 'rss',
						'body': item
					});
				}
			}, (err, response) => {

			});
		}
	}
}

var ingestor = new FeedIngestor();
ingestor.ingest();