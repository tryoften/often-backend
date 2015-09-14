import Worker from './Worker';
import FeedIngestor from '../Ingestors/Feed/FeedIngestor';
import config from '../config';
import _ from 'underscore';

class FeedIngestorWorker extends Worker {

	constructor (opts = {}) {
		let options = _.defaults(opts, config.firebase.queues.feed);

		super(options);
		this.ingestor = new FeedIngestor();

		// ingest new data every 5 minutes
	}

	process (data, progress, resolve, reject) {
		this.ingestor.ingest();
	}
}

export default FeedIngestorWorker;