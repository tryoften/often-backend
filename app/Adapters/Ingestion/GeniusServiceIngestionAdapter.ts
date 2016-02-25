import { Task } from '../../Workers/Worker';
import IngestionAdapter  from './IngestionAdapter';
import { firebase as FirebaseConfig } from '../../config';
import GeniusService from '../../Services/Genius/GeniusService';
import * as _ from 'underscore';
import Search from '../../Search/Search';
import MediaItemType from '../../Models/MediaItemType';
import { IndexableObject } from '../../Interfaces/Indexable';
import logger from '../../logger';
let fs = require('fs');

interface GeniusServiceIngestionRequest extends Task {
	ids: string[];
	type: MediaItemType;
	targets: IngestionTarget[];
}

interface IngestionTarget {
	type: IngestionTargetType;
	data: any;
}

class IngestionTargetType extends String {
	static elasticsearch: IngestionTargetType = 'elasticsearch';
	static file: IngestionTargetType = 'file';
}

class GeniusServiceIngestionAdapter extends IngestionAdapter {
	genius: GeniusService;
	search: Search;

	constructor (opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.BaseURL + FirebaseConfig.queues.elastic_dump_file);
		super(options);
		this.search = new Search();
	}

	process (data: GeniusServiceIngestionRequest, progress, resolve, reject) {
		logger.info('GeniusServiceIngestionWorker.process(): owner-id: ', data._owner, ' ids: ', data.ids, ' type: ', data.type);

		var ids = data.ids;
		var type = data.type;
		var targets = data.targets;

		var MediaItemClass = MediaItemType.toClass(type);
		var promises = [];

		for (var id of ids) {
			var mediaItem = new MediaItemClass({id: id});
			promises.push(mediaItem.syncData());
		}

		Promise.all(promises).then( syncedMediaItems => {
			logger.info('GeniusServiceIngestionWorker.process(): owner-id: ', data._owner, ' ids: ', data.ids, ' event: Synced all data.');
			var indexables = [];
			for (var smi of syncedMediaItems) {
				var indexingFormat = smi.toIndexingFormat();
				indexables.push(indexingFormat);
			}
			return indexables;
		}).then( allIndexables => {

			let targetPromises = [];
			for (let target of targets) {
				switch (target.type) {
					case (IngestionTargetType.file):
						targetPromises.push(this.writeToFS(target.data, allIndexables, type));
						break;

					case (IngestionTargetType.elasticsearch):
						targetPromises.push(this.indexToES(allIndexables));
						break;

					default:
						reject(targetPromises);
						return;
				}
			}
			return Promise.all(targetPromises);

		}).then((results) => {
			logger.info('GeniusServiceIngestionWorker.process(): owner-id: ', data._owner,
				' ids: ', data.ids, ' type: ', data.type, ' results: ', results);
			resolve(results);
		}).catch( err => {
			logger.error('GeniusServiceIngestionWorker.process(): owner-id: ', data._owner,
				' ids: ', data.ids, ' type: ', data.type, ' error: ', err);
			reject(err);
		});
	}

	indexToES (indexables: IndexableObject[]) {
		return this.search.index(indexables);
	}

	writeToFS (dir: string, indexables: IndexableObject[], type: MediaItemType) {

		return new Promise((resolve, reject) => {
			var writeString = '';
			for (var index of indexables) {
				var esFormat = this.search.getIndexFormat(index);
				writeString += JSON.stringify(esFormat[0]) + '\n' + JSON.stringify((esFormat[1])) + '\n';
			}

			var fileName = `${dir}/${type}-${Date.now()}`;
			fs.writeFile(fileName, writeString, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve(fileName);
				}
			});
		});
	}


}

export default GeniusServiceIngestionAdapter;
