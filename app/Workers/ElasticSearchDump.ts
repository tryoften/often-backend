import Worker from './Worker';
import { firebase as FirebaseConfig } from '../config';
import GeniusService from '../Services/Genius/GeniusService';
import * as _ from 'underscore';
import Search from '../Search/Search';
var fs = require('fs');
import MediaItemType from '../Models/MediaItemType';

class ElasticSearchDump extends Worker {
	genius: GeniusService;
	search: Search;

	constructor (opts = {}) {
		console.log('initiating');
		let options = _.defaults(opts, FirebaseConfig.queues.elastic_dump_file);
		super(options);
		this.search = new Search();
	}

	process (data, progress, resolve, reject) {
		console.log('processing...');
		var ids = data.ids;
		var type = data.type;
		var MediaItemClass = MediaItemType.toClass(type);
		var promises = [];


		for (var id of ids) {
			var mediaItem = new MediaItemClass({id: id});
			promises.push(mediaItem.syncData());
		}

		Promise.all(promises).then(syncedMediaItems => {
			console.log('synced');
			console.log(syncedMediaItems);
			var indexables = '';

			for (var smi of syncedMediaItems) {
				var indexed = smi.toIndexingFormat();
				var reqVal = this.search.getIndexFormat(indexed);
				indexables  += JSON.stringify(reqVal[0]) + '\n' + JSON.stringify(reqVal[1]) + '\n';
			}

			return indexables;
		}).then(myIndexables => {


			/* Write to disk */
			var fileName = `/Users/jdc/Documents/work/elastidump-2/dump-${type}-${Date.now()}`;
			fs.writeFile(fileName, myIndexables, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve(fileName);
				}

			});
		}).catch( err => {
			reject(err);
		});
	}

}

export default ElasticSearchDump;
