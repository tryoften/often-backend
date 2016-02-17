let minimist = require('minimist');
let config = require('./config');
let _ = require('underscore');

let argv = minimist(process.argv.slice(2));
console.dir(argv);
config.workers = argv._;

if (_.contains(argv._, 'search')) {
	let SearchWorker = require('./Workers/SearchWorker').default;
	console.log('starting search\n');
	new SearchWorker().start();
}

if (_.contains(argv._, 'feed-ingestor')) {
	let FeedIngestorWorker = require('./Workers/FeedIngestorWorker').default;
	console.log('starting feed ingestor\n');
	new FeedIngestorWorker().start();
}

if (_.contains(argv._, 'feedpage-parser')) {
	let FeedPageWorker = require('./Workers/FeedPageWorker').default;
	console.log('starting feed page parser');
	new FeedPageWorker().start();
}

if (_.contains(argv._, 'user')) {
	let UserWorker = require('./Workers/UserWorker').default;
	console.log('starting user worker');
	new UserWorker().start();
}

if (_.contains(argv._, 'link-redirector')) {
	let URIConverterService = require('./Utilities/URIConverterService').default;
	console.log('starting link-redirector');
	new URIConverterService().start();
}

if (_.contains(argv._, 'ingestion')) {
	let IngestionWorker = require('./Workers/IngestionWorker').default;
	console.log('starting ingestion-worker');
	new IngestionWorker().start();
}

if (_.contains(argv._, 'preingestion')) {
	let PreIngestionWorker = require('./Workers/PreIngestionWorker').default;
	console.log('starting preingestion-worker');
	new PreIngestionWorker().start();
}

if (_.contains(argv._, 'bulk-ingest')) {
	let BulkDataIngestor = require('./Workers/BulkDataIngestor').default;
	console.log('starting bulk ingestion-worker');
	new BulkDataIngestor().start();
}

if (_.contains(argv._, 'track-task-scheduler')) {
	let TrackTaskScheduler = require('./Schedulers/TrackTaskScheduler').default;
	console.log('starting track-task-scheduler');
	new TrackTaskScheduler().start();
}

if (_.contains(argv._, 'image-resizer')) {
	let ImageResizerWorker = require('./Workers/ImageResizerWorker').default;
	console.log('starting the image-resizer-worker');
	new ImageResizerWorker().start();
}

if (_.contains(argv._, 'elastic-ingestion')) {
	let BulkElasticSearchWorker = require('./Workers/BulkElasticSearchWorker').default;
	console.log('starting the bulk-elastic-search-worker');
	new BulkElasticSearchWorker().start();
}


console.log('firebase root URL: ', config.firebase.BaseURL);
console.log('elasticsearch root URL: ', config.elasticsearch.BaseURL);
