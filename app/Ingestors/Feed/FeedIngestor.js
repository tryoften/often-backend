import Feeds from '../../Collections/Feeds';

class FeedIngestor {

	constructor (opts = {}) {
		this.feeds = new Feeds();
	}

	ingest () {
		return new Promise((resolve, reject) => {
			this.feeds.once('sync', (data) => {
				for (let feed of this.feeds.models) {
					feed.processPages();
				}
			});
			this.feeds.fetch();
		});
	}
}

export default FeedIngestor;