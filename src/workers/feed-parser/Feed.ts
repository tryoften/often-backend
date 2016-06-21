import { Model } from 'backbone';
import config from '../config';
import { generateURIfromGuid } from '../Utilities/generateURI';
import getFeedPage from '../Utilities/getFeedPage';
import * as _ from 'underscore';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import logger from './../logger';
import Queue = require('firebase-queue');

/**
 * This class represents a atom/rss feed along with it's metadata and how to parse it 
 */
class Feed extends Model {
	reingest: boolean;
	queueEnabled: boolean;
	queue: Queue;
	taskQueueRef: Firebase;

	constructor(attributes: any, options: any) {
		super(attributes, options);
		this.url = `${config.firebase.BaseURL}/feeds/${this.id}`;
	}

	initialize (attributes: any, opts: any) {
		let defaults: any = {
			items: []
		};

		this.set(_.defaults(attributes, defaults));
		this.reingest = false;
		this.queueEnabled = opts.queueEnabled || false;

		if (!_.isUndefined(opts.collection)) {
			this.queueEnabled = opts.collection.queueEnabled;
		}
		
		if (this.queueEnabled) {
			var ref = UserTokenGenerator.getAdminReference(`${config.firebase.BaseURL}/queues/feeds/${this.id}`);
			this.queue = new Queue(ref, 
				_.defaults({
					suppressStack: false, 
					retries: 3,
					sanitize: false
				}, config.firebase.queues.default),
				this.processJob.bind(this));

			// task queue ref to schedule page parsing jobs
			this.taskQueueRef = UserTokenGenerator.getAdminReference(`${config.firebase.queues.feed.url}/tasks`);
		}
	}

	/**
	 * This fetches the initial rss feed and queues requests to remaining pages
	 *
	 * @param reingest {Bool} - whether we should reindex data has already been indexed
	 */
	processPages (reingest = false) {
		this.reingest = reingest;
		this.set('currentPage', 0);

		return getFeedPage(this.get('url')).then(data => {
			logger.info('Feed.queueJobs(): First page URL: ', this.get('url'));
			this.updateMetadata(data);
			this.queueJobs(data);
		});
	}

	updateMetadata (data: any) {
		let pageCount = 0;
		let baseURL = "";
		let paginationType = this.get('pagination');

		if (paginationType == 'link') {
			let meta = data.meta;
			let lastPage = _.find(meta['atom:link'], (s: any) => s['@'].rel == 'last');
			let lastPageURL = lastPage !== null ? lastPage['@'].href : '';
			let equalPosition = lastPageURL.indexOf('=') + 1;
			
			baseURL = lastPageURL.substring(0, equalPosition);
			pageCount = parseInt(lastPageURL.substring(equalPosition));
		}
		else if (paginationType == 'paged') {
			baseURL = `${this.get('url')}?paged=`;
			pageCount = 10;
		}
		else {
			baseURL = this.get('url');
			pageCount = 10;
		}

		logger.info('Total Pages: ' + pageCount);

		this.set({
			baseURL: baseURL,
			pageCount: pageCount
		});
	}

	/**
	 * Queues subsequent jobs onto feed queue
	 *
	 */
	queueJobs (data: any) {
		let firstItem = data.items[0];
		let guid = generateURIfromGuid(firstItem.guid);
		let url = `${config.firebase.BaseURL}/articles/${this.id}/items/${guid}`;
		let itemRef = UserTokenGenerator.getAdminReference(url);
		logger.info(`check if ${itemRef.toString()} exists`);

		// TODO(luc): set timeout after 10 seconds
		// if nothing comes back, assume feed is done ingesting

		itemRef.once('value', snapshot => {
			let shouldIngest = false;

			if (!snapshot.exists() || this.reingest) {
				shouldIngest = true;
			}

			if (shouldIngest) {
				logger.info(`Feed(${this.id}): ingesting`);

				let url = (this.get('pagination') === 'none') ?
					this.get('url') :
					this.get('baseURL') + this.get('currentPage');

				this.queueJob(url);
				this.set('currentPage', 0);
				logger.info('new task URL: ', url);

			} else {
				logger.warn(`Feed(${this.id}): nothing to ingest`);
			}
		});

	}

	queueJob (url: string) {
		let taskData = {
			pageURL: url,
			feed: {
				id: this.id
			},
			_state: 'start_page_parsing'
		};

		if (this.get('pagination') === 'none') {
			taskData.pageURL = this.get('url');
		}

		let newTaskRef = this.taskQueueRef.push(taskData);

		return taskData;
	}

	processJob (data: any, progress: any, resolve: any, reject: any) {
		let currentPage = this.get('currentPage');
		let pagination = this.get('pagination');

		if (pagination === 'none') {
			return;
		}

		// stop queueing jobs if at end of pages
		if (currentPage >= this.get('pageCount')) {
			let pagination = this.get('pagination');

			if (pagination === 'link' || pagination === 'none') {
				return;
			}

			if (pagination === 'paged') {
				this.set('pageCount', this.get('pageCount') + 10);
			}

			// check if the page fetching failed
		}

		let itemsRef = UserTokenGenerator.getAdminReference(`${config.firebase.BaseURL}/articles/${this.id}/items`);

		itemsRef.once('value', snapshot => {
			let shouldIngest = false;

			if (!_.isUndefined(data.processedItems)) {
				for (let processedItem of data.processedItems) {
					let guid = generateURIfromGuid(processedItem.guid);
					let child = snapshot.child(guid);
					logger.info(`Feed(): itemRef: ${itemsRef.toString()}/${guid}`);

					if (child.exists() && !this.reingest) {
						shouldIngest = false;
						break;
					} else {
						shouldIngest = true;	
					}
				}
			} else {
				shouldIngest = true;
			}

			if (shouldIngest) {		
				let taskData = this.queueJob(this.getNextPageURL());
				logger.info(`Feed.processJob(): Queuing next job URL (${taskData.pageURL})`);
			}
			resolve(data);
		});
	}

	getNextPageURL () {
		let baseURL = this.get('baseURL');
		let currentPage = this.get('currentPage') + 1;

		this.set('currentPage', currentPage);

		if (this.get('pagination') === 'none') {
			return this.get('url');
		}

		return baseURL + currentPage;
	}

	toJSON () {
		var obj = super.toJSON();
		delete obj.items;
		return obj;
	}

}

export default Feed;
