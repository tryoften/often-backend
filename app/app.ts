import SearchWorker from './Workers/SearchWorker';
import FeedIngestorWorker from './Workers/FeedIngestorWorker';
import FeedPageWorker from './Workers/FeedPageWorker';
import IngestionWorker from './Workers/IngestionWorker';
import UserWorker from './Workers/UserWorker';
import URIConverterService from './Utilities/URIConverterService';
import * as minimist from 'minimist';
import config from './config';
import * as _ from 'underscore';

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
	console.log('starting the user worker');
	new UserWorker().start();
}

if (_.contains(argv._, 'link-redirector')) {
	console.log('starting the link-redirector');
	new URIConverterService().start();
}

if (_.contains(argv._, 'ingestion')) {
	console.log('starting the ingestion-worker');
	new IngestionWorker().start();
}

console.log('firebase root URL: ', config.firebase.BaseURL);
console.log('elasticsearch root URL: ', config.elasticsearch.BaseURL);
