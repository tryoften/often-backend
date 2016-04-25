import { firebase as FirebaseConfig } from '../config';
import MediaItemType from './MediaItemType';
import MediaItem from './MediaItem';
import * as Firebase from 'firebase';
import { MediaItemAttributes } from './MediaItem';
import * as _ from 'underscore';
import MediaItemSource from "./MediaItemSource";
import Category, {CategoryAttributes} from './Category';
import {IndexableObject} from '../Interfaces/Indexable';

export interface IndexablePackItem extends IndexableObject {
	id?: string;
	category?: CategoryAttributes;
}

export interface PackAttributes extends MediaItemAttributes {
	id?: string;
	name?: string;
	image?: {
		small_url?: string;
		large_url?: string;
	};
	price?: number;
	premium?: boolean;
	featured?: boolean;
	published?: boolean;
	publishedTime?: string;
	description?: string;
	meta?: PackMeta;
	items?: IndexablePackItem[];
	items_count?: number;
	isFavorites?: boolean;
	isRecents?: boolean;
}

export interface PackIndexableObject extends PackAttributes {}

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
	 * @param attributes {PackAttributes}
	 * @param options
	 */
	constructor(attributes: PackAttributes = {}, options: any = {autoSync: false, setObjectMap: true}) {
		attributes = _.defaults(attributes, {
			type: MediaItemType.pack,
			source: MediaItemSource.Often
		});

		if (!attributes.items) {
			attributes.items = [];
		}
		attributes.type = MediaItemType.pack;

		super(attributes, options);

	}

	defaults(): Backbone.ObjectHash {
		return {
			name: '',
			description: '',
			published: false,
			type: MediaItemType.pack,
			source: MediaItemSource.Often,
			premium: false,
			deleted: false,
			featured: false,
			price: 0.0,
			image: {
				small_url: 'http://placehold.it/200x200',
				large_url: 'http://placehold.it/400x400'
			},
			items: [],
			isFavorites: false,
			isRecents: false
		};
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/packs/${this.id}`);
	}

	get name(): string {
		return this.get('name');
	}

	set name(value: string) {
		this.set('name', value);
	}

	get description(): string {
		return this.get('description');
	}

	get published(): boolean {
		return this.get('published');
	}

	get items(): IndexablePackItem[] {
		return this.get('items') || [];
	}

	get categories(): any {
		return this.get('categories') || {};
	}

	get items_count(): number {
		return this.get('items_count') || this.items.length;
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

	get featured(): boolean {
		return this.get('featured');
	}

	get isFavorites(): boolean {
		return this.get('isFavorites');
	}

	get isRecents(): boolean {
		return this.get('isRecents');
	}

	getTargetObjectProperties(): any {
		return {
			id: this.id,
			name: this.name,
			image: this.image,
			categories: this.categories,
			desscription: this.description,
			items: this.items,
			premium: this.premium,
			featured: this.featured,
			price: this.price,
			source: this.source,
			type: this.type,
			isFavorites: this.isFavorites,
			isRecents: this.isRecents
		};
	}

	/**
	 * Adds an individual media item to the pack
	 * @param item
     */
	addItem (item: MediaItem) {
		var itemObj = item.toJSON();

		var items = this.items;
		items.push(itemObj);

		this.save({items, items_count: items.length});
	}

	removeItem(item: IndexablePackItem) {
		var items = this.items;
		items = _.filter(items, a => a.id !== item.id);

		this.save({items});
	}


	assignCategoryToItem (itemId: string, category: Category) {

		/* First figure out which item to change */
		var currentItems = this.items;
		var currentCategories = this.categories;

		var oldCategoryInfo, oldIndex;
		for (let i = 0; i < currentItems.length; i++) {

			if (currentItems[i].id === itemId) {
				oldIndex = i;
				oldCategoryInfo = currentItems[i].category;
				currentItems[i].category = category.getTargetObjectProperties();
				currentCategories[category.id] = category.getTargetObjectProperties();
				category.setTarget(this, `/packs/${this.id}/categories/${category.id}`);
				category.setTarget(this, `/packs/${this.id}/items/${oldIndex}/category`);
				break;
			}
		}

		/* Go through every category and check if the old category still exists, if it doesn't then unset it on the pack's category collection as well */
		var removeCategoryFromPack = true;
		for (let item of currentItems) {
			if (item.category && oldCategoryInfo) {
				if (item.category.id === oldCategoryInfo.id) {
					removeCategoryFromPack = false;
					break;

				}
			}
		}

		/* Remove category from pack's category collection */
		if (oldCategoryInfo) {
			var oldCategory = new Category({id: oldCategoryInfo.id});
			oldCategory.syncData().then(() => {
				oldCategory.unsetTarget(this, `/packs/${this.id}/items/${oldIndex}/category`);
				if (removeCategoryFromPack) {
					oldCategory.unsetTarget(this, `/packs/${this.id}/categories/${oldCategory.id}`);
					currentCategories[oldCategory.id] = null;
					/* Save all changes */
					this.save({ items: currentItems, categories: currentCategories });
				}
			});
		} else {
			/* Save all changes */
			this.save({ items: currentItems, categories: currentCategories });
		}

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
		let data = _.extend({
			name: this.name || '',
			title: this.name || '',
			author: '',
			description: this.description || '',
			featured: this.featured || false,
			premium: this.premium || false,
			price: this.price || 0,
			image: this.image || {},
			items: this.items || [],
			items_count: this.items_count || this.items.length
		}, super.toIndexingFormat(), super.toJSON());

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
