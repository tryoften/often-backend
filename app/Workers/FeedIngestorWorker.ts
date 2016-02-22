import Worker from './Worker';
import FeedIngestor from '../Ingestors/Feed/FeedIngestor';
import config from '../config';
import * as _ from 'underscore';
import logger from '../logger';

/**
 * This worker handles
 */
class FeedIngestorWorker extends Worker {
	ingestor: FeedIngestor;

	constructor (opts = {}) {
		let options = _.defaults(opts, config.firebase.queues.feed);

		super(options);
		this.ingestor = new FeedIngestor();

		// trackIdsToIndexableObjects new data every 5 minutes
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
