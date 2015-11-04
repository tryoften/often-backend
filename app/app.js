import SearchWorker from './Workers/SearchWorker';
import FeedIngestorWorker from './Workers/FeedIngestorWorker';
import FeedPageWorker from './Workers/FeedPageWorker';
import UserWorker from './Workers/UserWorker';
import minimist from 'minimist';
import config from './config';
import _ from 'underscore';

var argv = minimist(process.argv.slice(2));
console.dir(argv);

if (_.contains(argv._, 'search')) {
	config.worker = 'search';
	console.log('starting search\n');
	var worker = new SearchWorker();
	worker.start();
}

if (_.contains(argv._, 'feed-ingestor')) {
	config.worker = 'feed-ingestor';
	console.log('starting feed ingestor\n');
	var worker = new FeedIngestorWorker();
	worker.start();
}

if (_.contains(argv._, 'feedpage-parser')) {
	config.worker = 'feedpage-parser';
	console.log('starting feed page parser');
	var worker = new FeedPageWorker();
	worker.start();
}

if (_.contains(argv._, 'user')) {
	config.worker = 'user';
	console.log('starting the user worker');
	var worker = new UserWorker();
	worker.start();
}

console.log('firebase root URL: ', config.firebase.BaseURL);
console.log('elasticsearch root URL: ', config.elasticsearch.BaseURL);