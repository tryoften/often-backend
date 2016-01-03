import request from 'request';
import Feedparser from 'feedparser';

export default function getFeedPage(url) {
	return new Promise((resolve, reject) => {
		var req = request(url);
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