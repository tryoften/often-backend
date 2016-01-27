import Worker from './Worker';
import { firebase as FirebaseConfig } from '../config';
import Search from '../Search/Search';
import MediaItemType from '../Models/MediaItemType';


class ESWorker extends Worker {
	search: Search;

	constructor (opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.queues.es_ingestion);
		super(options);
		this.search = new Search();
	}

	getIndexablesFromId (id, type) {
		return new Promise((resolve, reject) => {
			var MediaItemClass = MediaItemType.toClass(type);
			var mediaItem = new MediaItemClass({
				id: id
			});
			mediaItem.syncData().then( synced => {
				resolve(mediaItem.toIndexingFormat());
			});
		});
	}


	process (data, progress, resolve, reject) {

		var type = data.type;
		var ids = data.ids;

		if (ids.length === 0) {
			reject('Empty array');
		}
		var promises = [];
		for (let id of ids) {
			promises.push(this.getIndexablesFromId(id, type));
		}
		Promise.all(promises).then(indexables => {
			console.log('Indexing...');
			this.search.index(indexables).then(resp => {
				console.log('Indexed data');
			}).catch(err => {
				console.log(err);
			});
		}).catch( err => {
			console.log('err' + err);
		});


	}
}

export default ESWorker;
