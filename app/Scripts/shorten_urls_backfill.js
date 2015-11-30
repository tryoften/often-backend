import { Client } from 'elasticsearch';
import { elasticsearch as ElasticSearchConfig } from '../config';
import URLHelper from '../Utilities/URLHelper';

var client = new Client({
	host: ElasticSearchConfig.BaseURL
});
var urlHelper = new URLHelper();

client.search({
  index: [	"billboard", 
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
  			"xxlmag" ],
  q: '*:*',
  size: 100000 // a number higher than total number of documents in listed indices
}, (error, response) => {

	var documents = response.hits.hits;
	var bulkBody = [];
	for (var doc of documents) {
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
		}

		bulkBody.push({
			doc : updObj
		});
	}
	
	/* Bulk update all documents */
	client.bulk({
		body : bulkBody
	});
  	
});
