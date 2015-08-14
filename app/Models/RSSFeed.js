import Feedparser from 'feedparser';
import request from 'request';
import URL from 'url';
import _ from 'underscore';
import Queue from 'bull';
import cluster from 'cluster';


class RSSFeed {
	constructor (opts) {
		this.name = opts.name;
		this.url = opts.url;
		this.pageCount = 0;
		this.workersNum = 8;
		this.pages = [];
		this.totalPageCount = 0;
		this.queue = Queue('rss');
		this.queue.process(this.processJob);
	}

	/**
	 *	This fetches the initial rss feed and queues requests to remaining pages
	 */
	queueJobs () {
		var urls = [];

		this.request(this.url, (err, data) => {
			let meta = data.meta;

			if (this.totalPageCount == 0) {
				let lastPage = _.find(meta['atom:link'], s => s['@'].rel == 'last');
				let lastPageURL = lastPage != null ? lastPage['@'].href : "";
				let equalPosition = lastPageURL.indexOf('=');
				this.baseURL = lastPageURL.substring(0, equalPosition);
				this.totalPageCount = parseInt(lastPageURL.substring(equalPosition + 1));

				console.log('Total Pages: ' + this.totalPageCount);

				for (var i = 0; i <= this.totalPageCount; i++) {
					this.pages[i] = {
						URL: baseURL + (i + 1),
						processed: false
					};
				}
			}
		});
	}

	/**
	 * Creates workers to process jobs
	 */
	spawnWorkers () {
		if (cluster.isMaster) {
			for (let i = 0; i < this.workersNum; i++) {
				cluster.fork();
			}
		} else {

		}

		var itemsPerWorker = Math.ceil(this.totalPageCount / this.workersNum);
		cluster.on('online', function(worker) {

		});
	}

	/**
	 * Requests RSS feed data for provided url
	 * @param {string} url - request url
	 * @param {function} callback - callback invoked when request is completed
	 *
	 * @return {Request} - the request object
	 */
	request (url, callback) {
		var req = request(url);
		var feedparser = new Feedparser();
		var items = [];
		var meta;
		var errorHandler = (error) => {
			callback(error, nil);
		};

		req.on('error', errorHandler);
		feedparser.on('error', errorHandler);


		req.on('response', function (res) {
			var stream = this;

			if (res.statusCode != 200) {
				return this.emit('error', new Error('Bad status code'));
			}

			stream.pipe(feedparser);
		});

		feedparser.on('readable', function () {
		  // This is where the action is!
		  let stream = this, item;
		  meta = this.meta;

		  while (item = stream.read()) {
		  	items.push(item);
		  }
		});

		feedparser.on('end', (chunk) => {
			callback(null, {
				meta: meta,
				items: items
			});
		});

		return req;
	}


	processJob () {

	}

}

export default RSSFeed;