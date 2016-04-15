import { firebase as FirebaseConfig } from '../config';
import * as FirebaseApi from 'firebase';
import 'backbonefire';
import { Firebase } from 'backbone';
import BaseModelType from "./BaseModelType";
var ObjectHash = require('object-hash');

export interface ObjectMapAttributes {
	type: string;
	id: string;
}

class ObjectMap extends Firebase.Model {
	protected rootRef: FirebaseApi;
	constructor(attributes: ObjectMapAttributes, options?: any) {

		if (!attributes.type) {
			throw new Error('Type must be defined in object map attributes.');
		}

		if (!attributes.id) {
			throw new Error('ItemId must be defined in object map attributes');
		}

		super(attributes, options);
		this.rootRef = new FirebaseApi(FirebaseConfig.BaseURL);
	}

	get type(): string {
		return this.get('type');
	}

	public syncModel (): Promise<Firebase.Model> {
		return new Promise<Firebase.Model>( (resolve, reject) => {
			this.once('sync', model => {
				resolve(model);
			});
			this.fetch({
				error: (err) => {
					reject(err);
				}
			});
		});
	}

	get url(): Firebase {
		return new FirebaseApi(`${FirebaseConfig.BaseURL}/object_map/${this.get('type')}/${this.id}`);
	}

	get targets() {
		return this.get('targets') || {};
	}

	setTarget (id: string, type: string, targetPath: string) {
		var currentTargets = this.targets;
		var targetPathHash = ObjectHash(targetPath);

		if (currentTargets[id]) {
			var paths = currentTargets[id].paths || {};
			paths[targetPathHash] = targetPath;
			currentTargets[id].paths = paths;
		} else {

			var updateObject = {
				id: id,
				type: type,
				paths: {}
			};

			updateObject.paths[targetPathHash] = targetPath;
			currentTargets[id] = updateObject;
		}

		this.save({targets: currentTargets});
	}

	unsetTarget (id: string, type: string, targetPath: string) {
		var currentTargets = this.targets;
		var targetPathHash = ObjectHash(targetPath);

		if (currentTargets[id]) {
			var paths = currentTargets[id].paths || {};
			paths[targetPathHash] = null;
		}

		this.save({targets: currentTargets});
	}

	updateTargetsWithProperties (props: any): Promise<boolean> {

		//instantiate each model defined in object_map based on type and id and call save

		//First push changes to each
		var deepSync = true;
		var updatedTargets = new Promise((resolve, reject) => {
			var targets = this.targets;

			var updateObject = {};
			/* Loop through each target's path */
			for (let targetId in targets) {
				var paths = targets[targetId].paths
				if (paths) {
					for (let pathHash in paths) {
						var actualPath = paths[pathHash];
						updateObject[actualPath] = props;
					}
				}
			}

			console.log(updateObject);


			this.rootRef.update(updateObject, (error) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(targets);
			});

		});

		return new Promise((resolve, reject) => {
			updatedTargets.then((targets: any[]) => {
				if (deepSync) {
					/* Instantiate each target and then call save on each */
					//assume all a pack now
					var syncedPromises = [];
					for (var targetId in targets) {
						var target = targets[targetId];
						var BaseModelClass = BaseModelType.toClass(target.type);
						let syncPromise = new BaseModelClass({id: target.id, type: target.type}).syncData();
						syncedPromises.push(syncPromise);
					}
					return Promise.all(syncedPromises);
				}
				return Promise.resolve([]);
			}).then( (results) => {
				for (let result of results) {
					result[0].save();
				}
				resolve(results);
			}).catch( (err: Error) => {
				reject(err);
				return;
			});
		});

	}



}

export default ObjectMap;
