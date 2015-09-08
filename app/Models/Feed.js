import Feedparser from 'feedparser';
import request from 'request';
import URL from 'url';
import _ from 'underscore';

/**
 * This class represents a atom/rss feed along with it's metadata and how to parse it 
 */
class Feed {
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
		let pageCount = 0;
		let baseURL = "";

		if (this.paginationType == 'link') {
			let meta = data.meta;
			let lastPage = _.find(meta['atom:link'], s => s['@'].rel == 'last');
			let lastPageURL = lastPage !== null ? lastPage['@'].href : '';
			let equalPosition = lastPageURL.indexOf('=') + 1;
			
			baseURL = lastPageURL.substring(0, equalPosition);
			pageCount = parseInt(lastPageURL.substring(equalPosition));
		} 
		else if (this.paginationType == 'paged') {
			baseURL = `${this.url}?paged=`;
			pageCount = 10;
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
		while (this.ongoingRequests < this.concurrentRequests && this.processedIndex < this.pages.length) {
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

	processJob (job, err, data) {
		job.done = true;
		job.processing = false;
		console.log("Processed: ", job.URL);
		this.ongoingRequests--;

		if (err === null) {
			this.ingestData(data);
			this.queueRequests();
		} else {
			console.log(err);
		}
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

}

export default Feed;