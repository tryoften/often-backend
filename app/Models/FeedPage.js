import getFeedPage from '../Utilities/getFeedPage';
import { firebase as FirebaseConfig } from '../config';
import { generateURIfromGuid } from '../Utilities/generateURI';
import ImageResizerWorker from '../Workers/ImageResizerWorker';
import Firebase from 'firebase';
import cheerio from 'cheerio';

class FeedPage {

	/**
	 * @param {}
	 * @param {Feed} opts.feed - The feed from where the page originates
	 * @param {Search} opts.search - 
	 */
	constructor (opts) {
		this.url = opts.pageURL;
		this.feed = opts.feed;
		this.search = opts.search;
		this.feedRef = new Firebase(`${FirebaseConfig.BaseURL}/feeds/${this.feed.id}`);
		this.feedQueueRef = this.feedRef.child('queue/tasks');
		this.imageResizer = new ImageResizerWorker();
	}

	process (data) {
		this.request();
	}

	ingestData(data) {
		let self = this;
		let id = this.feed.id;

		return new Promise((resolve, reject) => {
			
			if (data.items.length) {
				let promises = [];
				
				for (let item of data.items) {
					promises.push(this.processItem(item));
				}

				Promise.all(promises).then(processedItems => {
					let items = [];

					for (let item of processedItems) {
						let guid = generateURIfromGuid(item.guid);
						let data = JSON.parse(JSON.stringify(item));
						self.feedRef.child(`items/${guid}`).set(data);

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

					this.search.bulk({body: items}, (err, resp) => {
						if (err) {
							reject(err);
						} else {
							let date = (data.items[0] !== null) ? data.items[0].date.toISOString() : '';
							let feedData = {
								url: this.url,
								date: date,
								processedItems: JSON.parse(JSON.stringify(processedItems))
							};
							this.feedQueueRef.push(feedData);
							console.log(`FeedPage(${this.url}).ingestData(): done ingesting`);
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
	request (data) {
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

	processItem (item) {
		function getImage(o) {
			if (o.image.url !== undefined) {
				return o.image.url;
			}

			if (o.enclosures.length > 0 && o.enclosures[0].url !== undefined) {
				return o.enclosures[0].url;
			}

			if (o["media:content"] !== undefined && 
				o["media:content"]["@"] !== undefined && 
				o["media:content"]["@"].url !== undefined && 
				o["media:content"]["@"].medium === "image") {
				return o["media:content"]["@"].url;
			}
			try {
				let $description = cheerio.load(o.description);
				let $image = $description('img');

				if ($image.length) {
					return $image.attr("src");
				}

			} catch (e) {}

			return null;
		}

		return new Promise((resolve, reject) => {
			let image = getImage(item);
			let data = {
				"title": item.title,
				"author": item.author,
				"date": item.date,
				"description": item.description,
				"guid": item.guid,
				"link": item.link,
				"summary": item.summary,
				"categories": item.categories,
				"image": image,
				"source": {
					"id": this.id,
					"name": this.name
				}
			};

			this.imageResizer
				.ingest('rss', this.feed.id, item.guid, image)
				.then(imageData => {
					data.images = imageData;

					// store item in firebase under feed
					resolve(data);
				})
				.catch(err => {
					console.error('FeedPage(): Image resizing failed ', err);
					resolve(data);
				});

		});

	}
}

export default FeedPage;