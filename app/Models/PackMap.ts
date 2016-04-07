import MediaItemType from './MediaItemType';
import ObjectMap from './MediaItemMap';
import { firebase as FirebaseConfig } from '../config';
import * as Firebase from 'firebase';

export interface PackMapAttributes {
	pack: Pack;
}

class PackMap extends ObjectMap {

	private pack: Pack;

	constructor(attributes: any, options?: any) {

		//TODO(jakub): Optionally pass in an id and instantiate and sync pack model in constructor
		if (!attributes.pack) {
			throw new Error('Must pass in a valid pack instance to PackMap');
		}

		var packInstance = attributes.pack;

		super({
			id: attributes.pack.id,
			type: MediaItemType.pack
		}, options);

		this.save();
		this.pack = packInstance;
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/object_map/${this.type}/${this.id}`);
	}

	/* Getters */
	get users() {
		return this.get('users') || {};
	}


	propagateChangesToUsers (): Promise<boolean> {

		return new Promise((resolve, reject) => {
			var userIds = Object.keys(this.users);
			var updateObject = {};
			var indexablePack = this.pack.toIndexingFormat();
			for (let userId of userIds) {
				updateObject[`users/${userId}/packs/${this.pack.id}`] = indexablePack;
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

	addUser (userId: string) {
		var currentUsers = this.users;
		currentUsers[userId] = true;
		this.save({users: currentUsers});
	}

	removeUser (userId: string) {
		var currentUsers = this.users;
		currentUsers[userId] = null;
		this.save({users: currentUsers});
	}




}

export default PackMap;
