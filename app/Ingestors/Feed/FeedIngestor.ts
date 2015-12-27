import Feeds from '../../Collections/Feeds';

class FeedIngestor {
	feeds: Feeds;
	feedCount: number;

	constructor (opts = {}) {
		this.feeds = new Feeds([], {
			queueEnabled: true
		});
		
		setInterval(() => {
			this.ingest();
		}, 15 * 60000);
	}

	/**
	 * Ingests data into elasticsearch
	 *
	 * @param reingest {Bool} - whether we should ingest data that has already been ingested
	 */
	ingest (reingest = false) {
		return new Promise((resolve, reject) => {
			this.feeds.once('sync', (data: Feeds) => {
				this.feedCount = this.feeds.models.length;
				
				for (let feed of this.feeds.models) {
					feed.processPages(reingest);
				}
			});
			this.feeds.fetch();
		});
	}
}

export default FeedIngestor;
