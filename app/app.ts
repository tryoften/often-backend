let minimist = require('minimist');
let config = require('./config');
let _ = require('underscore');

let argv = minimist(process.argv.slice(2));
console.dir(argv);
config.workers = argv._;

if (_.contains(argv._, 'search')) {
	let SearchWorker = require('./Workers/SearchWorker');
	console.log('starting search\n');
	new SearchWorker().start();
}

if (_.contains(argv._, 'feed-ingestor')) {
	let FeedIngestorWorker = require('./Workers/FeedIngestorWorker');
	console.log('starting feed ingestor\n');
	new FeedIngestorWorker().start();
}

if (_.contains(argv._, 'feedpage-parser')) {
	let FeedPageWorker = require('./Workers/FeedPageWorker');
	console.log('starting feed page parser');
	new FeedPageWorker().start();
}

if (_.contains(argv._, 'user')) {
	let UserWorker = require('./Workers/UserWorker');
	console.log('starting user worker');
	new UserWorker().start();
}

if (_.contains(argv._, 'link-redirector')) {
	let URIConverterService = require('./Utilities/URIConverterService');
	console.log('starting link-redirector');
	new URIConverterService().start();
}

if (_.contains(argv._, 'ingestion')) {
	let IngestionWorker = require('./Workers/IngestionWorker');
	console.log('starting ingestion-worker');
	new IngestionWorker().start();
}

if (_.contains(argv._, 'preingestion')) {
	let PreIngestionWorker = require('./Workers/PreIngestionWorker');
	console.log('starting preingestion-worker');
	new PreIngestionWorker().start();
}

if (_.contains(argv._, 'bulk-ingest')) {
	let BulkDataIngestor = require('./Workers/BulkDataIngestor');
	console.log('starting bulk ingestion-worker');
	new BulkDataIngestor().start();
}

if (_.contains(argv._, 'track-task-scheduler')) {
	let TrackTaskScheduler = require('./Schedulers/TrackTaskScheduler');
	console.log('starting track-task-scheduler');
	new TrackTaskScheduler().start();
}

if (_.contains(argv._, 'image-resizer')) {
	let ImageResizerWorker = require('./Workers/ImageResizerWorker');
	console.log('starting the image-resizer-worker');
	new ImageResizerWorker().start();
}

if (_.contains(argv._, 'elastic-ingestion')) {
	let ElasticSearchDump = require('./Workers/ElasticSearchDump');
	console.log('starting the elastic-ingestion-worker');
	new ElasticSearchDump().start();
}


console.log('firebase root URL: ', config.firebase.BaseURL);
console.log('elasticsearch root URL: ', config.elasticsearch.BaseURL);
