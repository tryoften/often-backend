import SearchWorker from './Workers/SearchWorker';
import FeedIngestorWorker from './Workers/FeedIngestorWorker';
import FeedPageWorker from './Workers/FeedPageWorker';
import IngestionWorker from './Workers/IngestionWorker';
import UserWorker from './Workers/UserWorker';
import URIConverterService from './Utilities/URIConverterService';
import ImageResizerWorker from './Workers/ImageResizerWorker';
import * as minimist from 'minimist';
import config from './config';
import * as _ from 'underscore';
import BulkDataIngestor from './Workers/BulkDataIngestor';
import ElasticSearchDump from "./Workers/ElasticSearchDump";

var argv = minimist(process.argv.slice(2));
console.dir(argv);

config.workers = argv._;
if (_.contains(argv._, 'search')) {
	console.log('starting search\n');
	new SearchWorker().start();
}

if (_.contains(argv._, 'feed-ingestor')) {
	console.log('starting feed ingestor\n');
	new FeedIngestorWorker().start();
}

if (_.contains(argv._, 'feedpage-parser')) {
	console.log('starting feed page parser');
	new FeedPageWorker().start();
}

if (_.contains(argv._, 'user')) {
	console.log('starting user worker');
	new UserWorker().start();
}

if (_.contains(argv._, 'link-redirector')) {
	console.log('starting link-redirector');
	new URIConverterService().start();
}

if (_.contains(argv._, 'ingestion')) {
	console.log('starting ingestion-worker');
	new IngestionWorker().start();
}

if (_.contains(argv._, 'bulk-ingest')) {
	console.log('starting bulk ingestion-worker');
	new BulkDataIngestor().start();
}

if (_.contains(argv._, 'image-resizer')) {
	console.log('starting the image-resizer-worker');
	new ImageResizerWorker().start();
}

if (_.contains(argv._, 'elastic-ingestion')) {
	console.log('starting the elastic-ingestion-worker');
	new ElasticSearchDump().start();
}


console.log('firebase root URL: ', config.firebase.BaseURL);
console.log('elasticsearch root URL: ', config.elasticsearch.BaseURL);
