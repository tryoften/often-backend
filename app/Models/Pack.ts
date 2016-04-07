import { firebase as FirebaseConfig } from '../config';
import MediaItemType from './MediaItemType';
import MediaItem from './MediaItem';
import * as Firebase from 'firebase';
import { MediaItemAttributes } from './MediaItem';
import * as _ from 'underscore';
import MediaItemSource from "./MediaItemSource";
import Category from './Category';
import PackMap from './PackMap';
import {IndexableObject} from '../Interfaces/Indexable';


export interface IndexablePackItem extends IndexableObject {
	id?: string;
	category_id?: string;
	category_name?: string;
}

export interface PackIndexableObject extends IndexableObject {
	id?: string;
	name?: string;
	image?: {
		small_url?: string;
		large_url?: string;
	};
	meta?: PackMeta;
	items?: IndexablePackItem[];
	price?: number;
	items_count?: number;
	premium?: boolean;
}

export interface PackAttributes extends MediaItemAttributes {
	id?: string;
	name?: string;
	price?: number;
	premium?: boolean;
	description?: string;
	image?: {
		small_url?: string;
		large_url?: string;
	};
	meta?: PackMeta;
	items?: IndexablePackItem[];
	items_count?: number;
}


interface MediaItemInfo {
	type: MediaItemType;
	id: string;
}

type UserId = string;
type PackMeta = Object;

class Pack extends MediaItem {

	private packMap: PackMap;

	/**
	 * Designated constructor
	 *
	 * @param attributes {PackAttributes}
	 * @param options
	 */
	constructor(attributes: PackAttributes = {}, options?: any) {
		attributes = _.defaults(attributes, {
			type: MediaItemType.pack,
			source: MediaItemSource.Often
		});

		if (!attributes.items) {
			attributes.items = [];
		}

		super(attributes, options);
		this.packMap = new PackMap({ pack: this });

	}


	syncData (): Promise<any> {
		return Promise.all([super.syncData(), this.packMap.syncData()]);
	}

	defaults(): Backbone.ObjectHash {
		return {
			name: '',
			description: '',
			type: MediaItemType.pack,
			source: MediaItemSource.Often,
			premium: false,
			price: 0.0,
			image: {
				small_url: 'http://placehold.it/200x200',
				large_url: 'http://placehold.it/400x400'
			},
			items: []
		};
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/packs/${this.id}`);
	}

	get name(): string {
		return this.get('name');
	}

	get description(): string {
		return this.get('description');
	}

	set name(value: string) {
		this.set('name', value);
	}

	get items(): IndexablePackItem[] {
		return this.get('items') || [];
	}

	get categories(): any {
		return this.get('categories') || {};
	}

	get items_count(): number {
		return this.get('items').length || -1;
	}

	get price(): number {
		return this.get('price') || 0.00;
	}

	get image(): any {
		return this.get('image') || {};
	}

	get premium(): boolean {
		return this.get('premium');
	}

	/**
	 * Sets an image url on a small image property
	 *
	 * @param url {string} - Url of a small image
	 */
	setSmallImage (url: string) {
		var image = this.image;
		image.small_url = url;
		this.save({image: image});
	}

	/**
	 * Sets an image url on a large image property
	 *
	 * @param url {string} - Url of a large image
	 */
	setLargeImage (url: string) {
		var image = this.image;
		image.large_url = url;
		this.save({image: image});
	}

	/**
	 * Adds an individual media item to the pack
	 * @param item
     */
	addItem (item: MediaItem) {
		var itemObj = item.toJSON();

		var items = this.items;
		items.push(itemObj);

		this.save({items});
	}

	removeItem(item: PackIndexableObject) {
		var items = this.items;
		items = _.filter(items, a => a.id !== item.id);

		this.save({items});
	}

	/**
	 * Propagates model changes to mapped user models and firebase
	 */
	save (obj?: any) {
		(obj) ? super.save(obj) : super.save();
		this.packMap.propagateChangesToUsers();
	}

	/**
	 * Adds a user to the packMap
	 * @param {string} userId - Id of a user to be added to the pack map
	 */
	mapUser (userId: string) {
		this.packMap.addUser(userId);
	}


	/**
	 * Removes a user from the packMap
	 * @param {string} userId - Id of a user to be removed from pack map
	 */
	unmapUser (userId: string) {
		this.packMap.removeUser(userId);
	}

	/**
	 * Assigns a category to an item on a pack and updates the catgories collection on the pack
	 *
	 * @param {string} itemId - Id of an item to be categorized.
	 * @param {Category} category - Category that is to be assigned to an item.
	 * @returns {void}
	 */
	assignCategoryToItem (itemId: string, category: Category) {

		var targetItem;
		var itemIndex = 0;

		for (let item of this.items) {

			if (itemId === item._id) {
				targetItem = item;
				break;
			}
			itemIndex++;
		}

		if (!targetItem) {
			throw new Error('Invalid item id selected for category change');
		}


		var newCategories = {};
		for (let item of this.items) {
			if (item.category_id && item._id !== itemId) {
				/* If a category_id is set on an item, then add it */
				newCategories[item.category_id] = this.get('categories')[item.category_id];
			}
		}

		/* Assign category on item */
		targetItem.category_name = category.name;
		targetItem.category_id = category.id;

		/* Finally update the categories collection on the pack */
		newCategories[category.id] = category.toIndexingFormat();
		this.url.child(`items/${itemIndex}`).update({
			category_name: category.name,
			category_id: category.id
		});

		this.save({ categories: newCategories});

	}


	/**
	 * Deserializes media items from an array of MediaItemInfo objects and sets them as items on the pack
	 *
	 * @param {MediaItemInfo[]}  mediaItemInfos - An array of MediaItemInfo items to be used for deserialization of corresponding media items
	 * @returns {Promise<IndexableObject[]>} - Promise resolving to an array of indexable objects derived from deserialized media items
	 */
	public setMediaItems (mediaItemInfos: MediaItemInfo[]): Promise<IndexablePackItem[]> {
		this.save();
		return new Promise((resolve, reject) => {

			this.deserializeMediaItems(mediaItemInfos).then( (mediaItems: MediaItem[]) => {
				var indexableMediaItems = this.getIndexableItems(mediaItems);
				this.save({items: indexableMediaItems});
				resolve(indexableMediaItems);
			});
		});
	}

	/**
	 * Turns an array of media items to an array of Indexebles by calling toIndexingFormat on each media item in the array
	 *
	 * @param {MediaItem[]} mediaItems - Array of media items
	 * @returns {IndexableObject[]} - Returns an array of indexable objects
	 */
	public getIndexableItems (mediaItems: MediaItem[]) {
		var indexables = [];
		for (var mi of mediaItems) {
			indexables.push(mi.toIndexingFormat());
		}
		return indexables;
	}

	/**
	 * Overwrite for base class's toIndexingFormat method
	 *
	 * @returns {IndexableObject}
	 */
	public toIndexingFormat(): IndexableObject {

		let data: PackIndexableObject = _.extend({
			name: this.name || '',
			title: this.name || '',
			author: '',
			description: this.description || '',
			premium: this.premium || false,
			price: this.price || 0,
			image: this.image || {},
			items: this.items || [],
			items_count: this.items_count || -1
		}, super.toIndexingFormat());

		return data;
	}

	/**
	 * Deserializes an array of MediaItemInfo items in order
	 *
	 * @param {MediaItemInfo[]} items - Objects representing media items
	 * @returns {Promise<MediaItem[]>} - Promise that resolves to an array of synced media items
	 */
	private deserializeMediaItems (items: MediaItemInfo[]): Promise<MediaItem[]> {

		var mediaItemPromises = [];

		for (let i = 0; i < items.length; i++) {
			mediaItemPromises[i] = this.fetchMediaItemFromInfo(items[i]);
		}

		return Promise.all(mediaItemPromises);
	}

	/**
	 * Returns a de-serialized media object derived from MediaItemInfo
	 *
	 * @param {MediaItemInfo} item - Object containing information to deserialize a media item
	 * @returns {Promise<MediaItem>} - Returns a promise resolving to a synced MediaItem from database.
	 */
	private fetchMediaItemFromInfo (item: MediaItemInfo): Promise<MediaItem> {
		var MediaItemClass = MediaItemType.toClass(item.type);
		return new MediaItemClass({id: item.id}).syncData();
	}


}

export default Pack;
