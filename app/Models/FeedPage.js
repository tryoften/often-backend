import getFeedPage from '../Utilities/getFeedPage';
import { firebase as FirebaseConfig } from '../config';
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
	}

	process (data) {
		this.request();
	}

	ingestData(data) {
		let id = this.feed.id;
		return new Promise((resolve, reject) => {
			var items = [];
			if (data.items.length) {
				for (let item of data.items) {
					items.push({
						'index': {
							'_index': id,
							'_id': item.guid,
							'_type': 'article'
						}
					});
					items.push(this.processItem(item));
				}
			}
			this.search.bulk({
				'body': items
			}, (err, resp) => {
				if (err) {
					reject(err);
				} else {
					let date = (data.items[0] !== null) ? data.items[0].date.toISOString() : '';
					let feedData = {
						url: this.url,
						date: date
					};
					this.feedQueueRef.push(feedData);
					console.log(`FeedPage(${this.url}).ingestData(): done ingesting`);
					resolve(feedData);
				}
			});
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

		return {
			"title": item.title,
			"author": item.author,
			"date": item.date,
			"description": item.description,
			"guid": item.guid,
			"link": item.link,
			"summary": item.summary,
			"categories": item.categories,
			"image": getImage(item),
			"source": {
				"id": this.id,
				"name": this.name
			}
		};
	}
}

export default FeedPage;