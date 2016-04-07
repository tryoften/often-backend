import { firebase as FirebaseConfig } from '../config';
import MediaItemType from './MediaItemType';
import MediaItem from './MediaItem';
import { IndexablePackItem } from '../Interfaces/Indexable';
import * as Firebase from 'firebase';
import { MediaItemAttributes } from './MediaItem';
import * as _ from 'underscore';
import MediaItemSource from "./MediaItemSource";
import Category from './Category';

export interface PackAttributes extends MediaItemAttributes {
	id?: string;
	name?: string;
	description?: string;
	subscribers?: UserId[];
	image?: {
		small_url?: string;
		large_url?: string;
	};
	meta?: PackMeta;
	items?: MediaItem[];
}

interface MediaItemInfo {
	type: MediaItemType;
	id: string;
}

type UserId = string;
type PackMeta = Object;

class Pack extends MediaItem {

	/**
	 * Designated constructor
	 *
	 * @param attributes {PackAttributes
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
	}

	defaults(): Backbone.ObjectHash {
		return {
			name: '',
			description: '',
			type: MediaItemType.pack,
			source: MediaItemSource.Often,
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

	/**
	 * Adds an individual media item to the pack
	 * @param item
     */
	addItem(item: MediaItem) {
		var itemObj = item.toJSON();

		var items = this.items;
		items.push(itemObj);

		this.save({items});
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
		for (var item of this.items) {
			if (itemId == item._id){
				targetItem = item;
				break;
			}
			itemIndex++;
		}

		if (!targetItem) {
			throw new Error('Invalid item id selected for category change');
		}


		var newCategories = {};
		for (var item of this.items) {
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

		this.set('categories', newCategories);
		this.save();



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
				this.set('items', indexableMediaItems);
				this.save();
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
