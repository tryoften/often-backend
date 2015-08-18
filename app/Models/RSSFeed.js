import Feedparser from 'feedparser';
import request from 'request';
import URL from 'url';
import _ from 'underscore';

class RSSFeed {
	constructor (opts) {
		this.id = opts.id;
		this.name = opts.name;
		this.url = opts.url;
		this.paginationType = opts.pagination;
		this.pages = [];
		this.processedIndex = 0;
		this.ongoingRequests = 0;
		this.concurrentRequests = 8;
		this.stopFetching = false;
		this.failedRequestsThreshold = 3;
		this.failedRequests = 0;
	}

	/**
	 *	This fetches the initial rss feed and queues requests to remaining pages
	 */
	processPages (backfill = false) {
		this.request(this.url, (err, data) => {
			this.ingestData(data);

			if (backfill) {
				this.queueBackfillData(data);
			}
		});
	}

	queueBackfillData(data) {
		let pageCount = 0
		let baseURL = ""

		if (this.paginationType == 'link') {
			let meta = data.meta;
			let lastPage = _.find(meta['atom:link'], s => s['@'].rel == 'last');
			let lastPageURL = lastPage != null ? lastPage['@'].href : '';
			let equalPosition = lastPageURL.indexOf('=') + 1;
			
			baseURL = lastPageURL.substring(0, equalPosition);
			pageCount = parseInt(lastPageURL.substring(equalPosition));
		} 
		else if (this.paginationType == 'paged') {
			baseURL = `${this.url}?paged=`;
			pageCount = 10
		}

		console.log('Total Pages: ' + pageCount);

		for (var i = 0; i < pageCount; i++) {
			this.pages[i] = {
				id: (i + 1),
				URL: baseURL + (i + 1),
				processing: false,
				done: false,
				request: null
			};
		}
		this.queueRequests();
	}

	queueRequests () {
		while (this.ongoingRequests < this.concurrentRequests 
			&& this.processedIndex < this.pages.length) {
			let job = this.pages[this.processedIndex++];

			if (job && !job.processing || !job.done) {
				job.processing = true;
				job.request = this.request(job.URL, this.processJob.bind(this, job));
				console.log("queued job ", job.id);
				this.ongoingRequests++;
			}
		}

		// we increment the number of pages by some value and attempt to fetch those pages
		// since we don't know the total number. Once failed page requests crosses the threshold
		// we stop fetching more 
		if (this.paginationType == 'paged' && !this.stopFetching) {
			let pageCount = this.pages.length + 10;
			let baseURL = `${this.url}?paged=`;

			for (var i = this.pages.length; i < pageCount; i++) {
				this.pages[i] = {
					id: (i + 1),
					URL: baseURL + (i + 1),
					processing: false,
					done: false,
					request: null
				};
			}

		}
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
			this.failedRequests++;
			if (this.failedRequests >= this.failedRequestsThreshold) {
				this.stopFetching = true;
			}
			callback(error, null);
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

	processJob (job, err, data) {
		job.done = true;
		job.processing = false;
		console.log("Processed: ", job.URL);
		this.ongoingRequests--;

		if (err == null) {
			this.ingestData(data);
			this.queueRequests();
		} else {
			console.log(err);
		}
	}

	ingestData(data) {
		var items = [];
		if (data.items.length) {
			for (let item of data.items) {
				items.push({
					'index': {
						'_index': this.id,
						'_id': item.guid,
						'_type': 'article'
					}
				});
				items.push(this.processItem(item));
			}
		}
		this.ingestor.search.bulk({
			'body': items
		});
	}

	/**
		stores the rss feed item in elastic search and indexes it
	*/
	indexItemInSearchEngine(item) {
		return {
			'index': this.id,
			'id': item.guid,
			'type': 'feed',
			'body': item
		};
	}

	processItem (item) {
		return {
			"title": item.title,
			"author": item.author,
			"date": item.date,
			"description": item.description,
			"guid": item.guid,
			"link": item.link,
			"summary": item.summary,
			"categories": item.categories,
			"source": {
				"id": this.id,
				"name": this.name
			}
		};
	}

}

export default RSSFeed;