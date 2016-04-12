import { firebase as FirebaseConfig } from '../config';
import * as FirebaseApi from 'firebase';
import 'backbonefire';
import { Firebase } from 'backbone';
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
		return new FirebaseApi(`${FirebaseConfig.BaseURL}/object_map/${this.type}/${this.id}`);
	}

	get type() {
		return this.get('type');
	}

	get targets() {
		return this.get('targets') || {};
	}

	setTarget (targetPath: string) {
		var currentTargets = this.targets;
		var targetPathHash = ObjectHash(targetPath);
		currentTargets[targetPathHash] = targetPath;
		this.save({targets: currentTargets});
	}

	unsetTarget (targetPath: string) {
		var currentTargets = this.targets;
		var targetPathHash = ObjectHash(targetPath);
		currentTargets[targetPathHash] = null;
		this.save({targets: currentTargets});
	}

	updateTargetsWithProperties (props: any): Promise<boolean> {

		return new Promise((resolve, reject) => {
			var targetIds = Object.keys(this.targets);
			var updateObject = {};
			for (let targetId of targetIds) {
				var targetPath = this.targets[targetId];
				updateObject[targetPath] = props;
			}

			this.rootRef.update(updateObject, (error) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(true);
			});

		});

	}



}

export default ObjectMap;
