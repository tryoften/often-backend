/// <reference path="../typings/tsd.d.ts" />
let _ = require('underscore');
let minimist = require('minimist');
let config = require('./config');
let argv = minimist(process.argv.slice(2));
let db = require('./db');

console.dir(argv);
config.workers = argv._;


if (_.contains(argv._, 'user')) {
	let UserWorker = require('./workers/user/UserWorker').default;
	console.log('starting user worker');
	new UserWorker().start();
}

if (_.contains(argv._, 'image-resizer')) {
	let ImageResizerWorker = require('./workers/image-resizer/ImageResizerWorker').default;
	console.log('starting the image-resizer-worker');
	new ImageResizerWorker().start();
}

if (_.contains(argv._, 'notification')) {
	let NotificationWorker = require('./workers/notification/NotificationWorker').default;
	console.log('starting the notification-worker');
	new NotificationWorker().start();
}

console.log('firebase root URL: ', config.firebase.BaseURL);
console.log('elasticsearch root URL: ', config.elasticsearch.BaseURL);
