import { Client } from 'elasticsearch';
import { elasticsearch as ElasticSearchConfig } from '../config';
import URLHelper from '../Utilities/URLHelper';
import minimist from 'minimist';

var client = new Client({
	host: ElasticSearchConfig.BaseURL
});
var urlHelper = new URLHelper();
var argv = minimist(process.argv.slice(2));

var indexes = [	
	"billboard", 
	"complex-music", 
	"elitedaily", 
	"factmag", 
	"fader", 
	"fourpins", 
	"highsnobiety",
	"hnhh",
	"hypebeast",
	"mtv-news",
	"paper",
	"pigeonsandplanes",
	"spin-music",
	"tmz",
	"vibe-music",
	"vibe-news",
	"vice",
	"xxlmag" 
];

if (argv._.length > 0) {
	indexes = argv._;
	console.log("Processing indexes: ", indexes);
}

client.search({
  index: indexes,
  q: '*:*',
  size: 200000 // a number higher than total number of documents in listed indices
}, (error, response) => {

	var documents = response.hits.hits;
	var bulkBody = [];
	var i = 0;
	console.warn(documents.length + " documents to convert");

	for (var doc of documents) {
		console.log("converting document #" + (i++) + ": " + doc._id);
		bulkBody.push({
			update: {
				_index: doc._index, 
				_type: doc._type, 
				_id: doc._id 
			} 
		});

		var updObj = {
			original_url: doc._id,
			link: urlHelper.shortenUrl(doc._id)
		};

		// console.log("shortened url: ", updObj.link);

		bulkBody.push({
			doc : updObj
		});
	}
	
	/* Bulk update all documents */
	client.bulk({
		body : bulkBody
	}, (err, res) => {
		if (err) {
			process.exit(1);
			return;
		}
		process.exit();
	});
  	
});
