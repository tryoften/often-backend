import request from 'request';
import Feedparser from 'feedparser';

class FeedPage {

	/**
	 * @param {}
	 * @param {Feed} opts.feed - The feed from where the page originates
	 * @param {Search} opts.ingestor - 
	 */
	constructor (opts) {
		this.url = opts.url;
		this.feed = opts.feed;
		this.ingestor = opts.ingestor;
	}

	process () {
		this.request();
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
	 * Requests RSS feed data for provided url
	 *
	 * @return {Promise} - the request object
	 */
	request () {
		return new Promise((resolve, reject) => {
			var req = request(this.url);
			var feedparser = new Feedparser();
			var items = [];
			var meta;
			var errorHandler = (error) => {
				reject(error);
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

			  while ((item = stream.read())) {
			  	items.push(item);
			  }
			});

			feedparser.on('end', (chunk) => {
				resolve({
					meta: meta,
					items: items
				});
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