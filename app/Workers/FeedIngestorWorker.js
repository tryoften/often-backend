import Worker from './worker';
import FeedIngestor from '../Ingestors/Feed/FeedIngestor';

class FeedIngestorWorker extends Worker {

	process (data, progress, resolve, reject) {
		var ingestor = new FeedIngestor();
		ingestor.ingest(true);
	}
}

export default FeedIngestorWorker;