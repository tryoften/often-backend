import { firebase as FirebaseConfig } from '../config';
import MediaItemType from './MediaItemType';
import MediaItem from './MediaItem';
import { IndexableObject } from '../Interfaces/Indexable';
import * as Firebase from 'firebase';
import { MediaItemAttributes } from './MediaItem';
import * as _ from 'underscore';
import MediaItemSource from "./MediaItemSource";

export interface PackAttributes extends MediaItemAttributes {
	id?: string;
	name?: string;
	subscribers?: UserId[];
	image?: Object;
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
	constructor(attributes: PackAttributes, options?: any) {
		attributes = _.defaults(attributes, {
			type: MediaItemType.pack,
			source: MediaItemSource.Often
		});

		if (!attributes.items) {
			attributes.items = [];
		}

		super(attributes, options);
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

	get items(): IndexableObject[] {
		return this.get('items');
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
	 * Deserializes media items from an array of MediaItemInfo objects and sets them as items on the pack
	 *
	 * @param {MediaItemInfo[]}  mediaItemInfos - An array of MediaItemInfo items to be used for deserialization of corresponding media items
	 * @returns {Promise<IndexableObject[]>} - Promise resolving to an array of indexable objects derived from deserialized media items
	 */
	public setMediaItems (mediaItemInfos: MediaItemInfo[]): Promise<IndexableObject[]> {
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