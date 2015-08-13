import Feedparser from 'feedparser';
import request from 'request';
import URL from 'url';
import Queue from 'bull';

class RSSFeed {
	constructor (opts) {
		this.name = opts.name;
		this.url = opts.url;
		this.pageCount = 0;
		this.pages = [];
		this.totalPageCount = 0;
		this.queue = Queue('rss');
	}

	/*
		This fetches the initial rss feed and queues requests to remaining pages
	*/
	queueJobs () {
		var urls = [];
		var req = request(url);

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

		  if (this.totalPageCount == 0) {
			let lastPageURL = URL.parse(meta['atom:link'][4]['@'].href);
			this.totalPageCount = lastPageURL.substring(lastPageURL.indexOf('='));

			console.log('Total Pages: ' + this.totalPagesCount);

			for (var i = 0; i < this.totalPagesCount; i++) {
				this.pages[i] = false;
			}
		  }
		});
	}

	request (url, callback) {
		var req = request(url);
		var feedparser = new Feedparser();
		var items = [];
		var meta;

		req.on('error', (error) => {

		});

		req.on('response', function (res) {
			var stream = this;

			if (res.statusCode != 200) {
				return this.emit('error', new Error('Bad status code'));
			}

			stream.pipe(feedparser);
		});

		feedparser.on('error', (error) => {

		});

		feedparser.on('readable', function () {
		  // This is where the action is!
		  let stream = this, item;
		  meta = this.meta;

		  if (this.totalPageCount == 0) {
			let lastPageURL = URL.parse(meta['atom:link'][4]['@'].href);
			this.totalPageCount = lastPageURL.substring(lastPageURL.indexOf('='));

			console.log('Total Pages: ' + this.totalPagesCount);

			for (var i = 0; i < this.totalPagesCount; i++) {
				this.pages[i] = false;
			}
		  }



		  while (item = stream.read()) {
		  	items.push(item);
		  }
		});

		feedparser.on('end', (chunk) => {
			callback(null, items);
			console.log(meta['atom:link']);
			let nextLink = meta['atom:link'][1]['@'].href;
			console.log("next link: ", nextLink);

			this.request(nextLink, (err, data) => {
				callback(null, items);
			});
		});
	}


	parseData () {
		
	}

}

export default RSSFeed;