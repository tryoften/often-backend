import Feedparser from 'feedparser';
import Firebase from 'firebase';
import Queue from 'firebase-queue';
import config from '../config';
import { Model } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import getFeedPage from '../Utilities/getFeedPage';
import URL from 'url';
import _ from 'underscore';

/**
 * This class represents a atom/rss feed along with it's metadata and how to parse it 
 */
class Feed extends Model {

	initialize (attributes, opts) {
		let defaults = {
			items: []
		};

		this.set(_.defaults(attributes, defaults));
		this.reingest = false;
		
		let url = `${this.url()}/queue`;
		this.queue = new Queue(new Firebase(url), 
			_.defaults({
				suppressStack: false, 
				retries: 3
			}, FirebaseConfig.queues.default), 
			this.processJob.bind(this));

		// task queue ref to schedule page parsing jobs
		this.taskQueueRef = new Firebase(`${FirebaseConfig.queues.feed.url}/tasks`);
		console.log('Feed.initialize(): task queue URL: ', this.taskQueueRef.toString());
	}

	/**
	 * This fetches the initial rss feed and queues requests to remaining pages
	 *
	 * @param reingest {Bool} - whether we should reindex data has already been indexed
	 */
	processPages (reingest = false) {
		this.reingest = reingest;

		return getFeedPage(this.get('url')).then(data => {
			this.updateMetadata(data);
			this.queueJobs(data);
		});
	}

	url () {
		return `${FirebaseConfig.BaseURL}/feeds/${this.id}`;
	}

	updateMetadata (data) {
		let pageCount = 0;
		let baseURL = "";
		let paginationType = this.get('pagination');

		if (paginationType == 'link') {
			let meta = data.meta;
			let lastPage = _.find(meta['atom:link'], s => s['@'].rel == 'last');
			let lastPageURL = lastPage !== null ? lastPage['@'].href : '';
			let equalPosition = lastPageURL.indexOf('=') + 1;
			
			baseURL = lastPageURL.substring(0, equalPosition);
			pageCount = parseInt(lastPageURL.substring(equalPosition));
		} 
		else if (paginationType == 'paged') {
			baseURL = `${this.get('url')}?paged=`;
			pageCount = 10;
		}

		console.log('Total Pages: ' + pageCount);

		this.set({
			baseURL: baseURL,
			pageCount: pageCount
		});
	}

	/**
	 * Queues subsequent jobs onto feed queue
	 *
	 */
	queueJobs (data) {
		let firstItem = data.items[0];
		let guid = new Buffer(firstItem.guid).toString('base64');
		let url = `${this.url()}/items/${guid}`;
		let itemRef = new Firebase(url);
		console.log(`check if ${itemRef.toString()} exists`);

		itemRef.once('value', snapshot => {
			let shouldIngest = false;

			if (!snapshot.exists()) {
				shouldIngest = true;
			}

			if (shouldIngest) {
				console.log(`Feed(${this.id}): ingesting`);

				this.set('currentPage', 0);
				let taskData = {
					pageURL: this.get('baseURL') + this.get('currentPage'),
					feed: this.toJSON(),
					_state: 'start_page_parsing'
				};

				if (this.get('pagination') == 'none') {
					taskData.pageURL = this.get('url');
				}

				let newTaskRef = this.taskQueueRef.push(taskData);
				console.log('new task URL: ', newTaskRef.toString());

			} else {
				console.warn(`Feed(${this.id}): nothing to ingest`);
			}
		});

	}

	processJob (data, progress, resolve, reject) {
		let currentPage = this.get('currentPage');

		// stop queueing jobs if at end of pages
		if (currentPage >= this.get('pageCount')) {
			let pagination = this.get('pagination');
			if (pagination == 'link' || pagination == 'none') {
				return;
			}

			if (pagination == 'paged') {
				this.set('pageCount', this.get('pageCount') + 10);
			}

			// check if the page fetching failed
		}

		let itemsRef = new Firebase(`${FirebaseConfig.BaseURL}/feeds/${this.id}/items`);

		itemsRef.once('value', snapshot => {
			let shouldIngest = false;
			for (let processedItem of data.processedItems) {
				let guid = new Buffer(processedItem.guid).toString('base64');
				let child = snapshot.child(guid);
				
				console.info(`Feed(): itemRef: ${itemsRef.toString()}/${guid}`);

				if (child.exists() && !this.reingest) {
					shouldIngest = false;
					break;
				} else {
					shouldIngest = true;	
				}
			}

			if (shouldIngest) {
				let taskData = {
					pageURL: this.getNextPageURL(),
					feed: this.toJSON(),
					_state: 'start_page_parsing'
				};
				console.log(`Feed.processJob(): Queuing next job URL (${taskData.pageURL})`);
				this.taskQueueRef.push(taskData);
			}
			resolve(data);
		});
	}

	getNextPageURL () {
		let baseURL = this.get('baseURL');
		let currentPage = this.get('currentPage') + 1;

		this.set('currentPage', currentPage);

		return baseURL + currentPage;
	}

	toJSON () {
		var obj = super.toJSON();
		delete obj.items;
		return obj;
	}

}

export default Feed;