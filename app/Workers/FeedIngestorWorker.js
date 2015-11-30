import Worker from './Worker';
import FeedIngestor from '../Ingestors/Feed/FeedIngestor';
import config from '../config';
import _ from 'underscore';
import logger from '../Models/Logger';

class FeedIngestorWorker extends Worker {

	constructor (opts = {}) {
		let options = _.defaults(opts, config.firebase.queues.feed);

		super(options);
		this.ingestor = new FeedIngestor();

		// ingest new data every 5 minutes
	}

	process (data, progress, resolve, reject) {
		var reingest = false;

		if (_.isBoolean(data.reingest)) {
			reingest = data.reingest;
			logger.info('FeedIngestorWorker(): reingest true');
		}

		this.ingestor.ingest(reingest);
	}
}

export default FeedIngestorWorker;