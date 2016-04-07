import { firebase as FirebaseConfig } from '../config';
import * as Firebase from 'firebase';
import BaseModel from './BaseModel';
import MediaItemType from './MediaItemType';

export interface ObjectMapAttributes {
	type: MediaItemType;
	id: string;
}

class ObjectMap extends BaseModel {
	protected rootRef: Firebase;
	constructor(attributes: ObjectMapAttributes, options?: any) {

		if (!attributes.type) {
			throw new Error('Type must be defined in media item map attributes.');
		}

		if (!attributes.id) {
			throw new Error('ItemId must be defined in media item map attributes');
		}

		super(attributes, options);
		this.rootRef = new Firebase(FirebaseConfig.BaseURL);
	}

	get type() {
		return this.get('type');
	}


}

export default ObjectMap;
