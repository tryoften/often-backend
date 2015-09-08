import SearchWorker from './Workers/SearchWorker';
import FeedIngestor from './Workers/FeedIngestorWorker';
import minimist from 'minimist';
import _ from 'underscore';

var argv = minimist(process.argv.slice(2));
console.dir(argv);

if (_.contains(argv._, 'search')) {
	console.log('starting search\n');
	var worker = new SearchWorker();
	worker.start();
}

if (_.contains(argv._, 'feed-ingestor')) {
	console.log('starting feed ingestor\n');
	var worker = new FeedIngestorWorker();
	worker.start();
}