import getFeedPage from '../Utilities/getFeedPage';
import config from '../config';
import { generateURIfromGuid } from '../Utilities/generateURI';
import ImageResizerWorker from '../Workers/ImageResizerWorker';
import * as Firebase from 'firebase';
import * as cheerio from 'cheerio';
import URLHelper from '../Utilities/URLHelper';
import * as _ from 'underscore';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import logger from './../logger';
import Search from '../Search/Search';
import Feed from './Feed';

class FeedPage {
	url: string;
	feed: Feed;
	search: any;
	feedRef: Firebase;
	feedQueueRef: Firebase;
	imageResizer: ImageResizerWorker;
	urlHelper: URLHelper;

	/**
	 * @param {}
	 * @param {Feed} opts.feed - The feed from where the page originates
	 * @param {Search} opts.search
	 */
	constructor (opts: {pageURL: string, feed: Feed, search: Search}) {
		this.url = opts.pageURL;
		this.feed = opts.feed;
		this.search = opts.search;
		this.feedRef = UserTokenGenerator.getAdminReference(`${config.firebase.BaseURL}/articles/${this.feed.id}`);
		this.feedQueueRef = UserTokenGenerator.getAdminReference(`${config.firebase.BaseURL}/queues/feeds/${this.feed.id}/tasks`);
		this.imageResizer = new ImageResizerWorker();
		this.urlHelper = new URLHelper();
	}

	process (data: any) {
		this.request();
	}

	ingestData(data: any) {
		let self = this;
		let id = this.feed.id;

		return new Promise((resolve, reject) => {
			
			if (data.items.length) {
				let promises: Promise<Object>[] = [];
				
				for (let item of data.items) {
					promises.push(this.processItem(item));
				}

				Promise.all(promises).then((processedItems: any) => {
					let items: Object[] = [];

					for (let item of processedItems) {
						let guid = generateURIfromGuid(item.guid);
						let data = JSON.parse(JSON.stringify(item));
						self.feedRef.child('items').child(guid).set(data);

						items.push({
							'update': {
								'_index': id,
								'_id': item.guid,
								'_type': 'article'
							}
						});
						items.push({
							'doc_as_upsert': true,
							'doc': item
						});
					}

					this.search.bulk({body: items}, (err: Error, resp: any) => {
						if (err) {
							reject(err);
						} else {
							let feedData = {
								url: this.url,
								processedItems: JSON.parse(JSON.stringify(processedItems))
							};
							this.feedQueueRef.push(feedData);

							logger.info(`FeedPage(${this.url}).ingestData(): done ingesting`);
							resolve(feedData);
						}
					});
				}).catch(err => {
					reject(err);
				});
			}

		});
	}

	/**
	 * Requests RSS feed data for provided url
	 *
	 * @return {Promise} - the request object
	 */
	request () {
		return new Promise((resolve, reject) => { 
			getFeedPage(this.url)
				.then(this.ingestData.bind(this))
				.then(data => {
					resolve(data);
				})
				.catch(err => {
					reject(err);
				});
		});
	}

	processItem (item: any) {
		function getImage(o: any) {
			if (o.image.url !== undefined) {
				return o.image.url;
			}

			if (o.enclosures.length > 0 && o.enclosures[0].url !== undefined) {
				return o.enclosures[0].url;
			}

			if (o['media:content'] !== undefined &&
				o['media:content']['@'] !== undefined &&
				o['media:content']['@'].url !== undefined &&
				o['media:content']['@'].medium === 'image') {
				return o['media:content']['@'].url;
			}

			try {
				let $description = cheerio.load(o.description);
				let $image = $description('img');

				if ($image.length) {
					return $image.attr('src');
				}

			} catch (e) {}

			return null;
		}

		return new Promise((resolve, reject) => {

			let image = getImage(item);

			// TODO(luc): define interface from this object
			let data: any = {
				'title': item.title,
				'author': item.author,
				'date': item.date,
				'description': item.description,
				'guid': item.guid,
				'link': item.link,
				'original_url': item.link,
				'summary': item.summary,
				'categories': item.categories,
				'image': image,
				'source': {
					'id': this.feed.id
				}
			};
			data.link = this.urlHelper.shortenUrl(data.link);
			if (_.isUndefined(image) || _.isNull(image)) {
				resolve(data);
				return;
			}
			
			this.imageResizer
			.ingest('rss', this.feed.id, item.guid, image)
			.then(imageData => {
				data.images = imageData;

				// store item in firebase under feed
				resolve(data);
			})
			.catch(err => {
				logger.error('FeedPage(): Image resizing failed ', err);
				resolve(data);
			});

		});

	}
}

export default FeedPage;
