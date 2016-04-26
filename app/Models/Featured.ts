import * as _ from 'underscore';
import { firebase as FirebaseConfig } from '../config';
import MediaItemAttributes from '../Models/MediaItem';
import MediaItemType from '../Models/MediaItemType';
import BaseModel from "../Models/BaseModel";
import MediaItem from "./MediaItem";
import {IndexableObject} from "../Interfaces/Indexable";

interface FeaturedAttributes {
	id: string;
	type: MediaItemType;
	items?: MediaItemAttributes[];
}


export default class Featured extends BaseModel {

	type: MediaItemType;

	constructor(attributes: FeaturedAttributes, options: any = {autoSync: false, setObjectMap: false}) {

		if (!attributes.id) {
			throw new Error('Id must be defined in featured attributes.');
		}

		if (!attributes.type) {
			throw new Error('Type must be defined in featured attributes.');
		}

		super(attributes, options);
	}

	get items(): IndexableObject[] {
		return this.get('items') || [];
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/featured/${this.type}`);
	}

	defaults(): Backbone.ObjectHash {
		return {
			items: []
		};
	}

	addFeaturedItem (item: MediaItem) {
		var currentItems = this.items;

		/* Check if item already exists */
		for (var currItem of currentItems) {
			if (currItem.id === item.id) {
				return;
			}
		}

		currentItems.push(item.toIndexingFormat());
		this.save({items: currentItems});
	}

	removeFeaturedItem (itemId: string) {
		var currentItems = this.items;
		for (let index in currentItems) {
			if (currentItems[index].id === itemId) {
				currentItems[index] = null;
			}
		}
		this.save({items: _.compact(currentItems)});
	}

}
