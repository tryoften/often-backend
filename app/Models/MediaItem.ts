import BaseModel from './BaseModel';
import MediaItemType from './MediaItemType';
import MediaItemSource from './MediaItemSource';
import { firebase as FirebaseConfig } from '../config';
import { generate as generateId } from 'shortid';
import { Indexable, IndexedObject } from '../Interfaces/Indexable';
import Firebase = require('firebase');
import IDSpace from './IDSpace';

export interface MediaItemAttributes {
	id?: string;
	source: MediaItemSource;
	type: MediaItemType;
	score?: number;
}

/**
 * Base model for media items. Includes all the metadata to query object from backend database
 */
export class MediaItem extends BaseModel implements Indexable {
	/**
	 * Designated constructor
	 *
	 * @param attributes
	 * @param options
     */
	constructor(attributes: MediaItemAttributes, options?: any) {
		if (attributes.id == null) {
			attributes.id = generateId();
		}

		if (attributes.score == null) {
			attributes.score = 0.0;
		}
		this.autoSync = true;

		super(attributes, options);
	}

	/**
	 * Creates media item from a service provider id by specifying the source, type and provider id
	 *
	 * @param source - source id (e.g. Spotify, Soundcloud, etc...)
	 * @param type - type of the id (e.g. lyric, track, etc...)
	 * @param providerId - service provider id (e.g. spotify:track:xxx)
	 * @returns {Promise<MediaItem>} Resolves to a new or existing MediaItem model
     */
	public static fromType(source: MediaItemSource, type: MediaItemType, providerId: string): Promise<MediaItem> {
		var MediaItemClass = MediaItemType.toClass(type);

		return new Promise<MediaItem>( (resolve, reject) => {
			IDSpace.instance.syncData().then(() => {
				let oftenId = IDSpace.instance.getOftenIdFrom(source, type, providerId);
				var model: typeof MediaItemClass;

				if (oftenId) {
					console.log(`Found often id for ${source}:${type}:${providerId} = ${oftenId}`);
					model = new MediaItemClass({source, type, id: oftenId});
				} else {
					console.log(`Often id not found for ${source}:${type}:${providerId}, creating new model`);
					model = new MediaItemClass({ source, type });
					IDSpace.instance.registerId(model, providerId);
					model.save();
				}

				resolve(model);
			});
		});
	}

	/**
	 * Looks up an often id for a given service provider Id
	 *
	 * @param source - source id (e.g. Spotify, Soundcloud, etc...)
	 * @param type - type of the id (e.g. lyric, track, etc...)
	 * @param id - service provider id (e.g. spotify:track:xxx)
	 * @returns {Promise<string>} resolves with often id or fails if id is not found
     */
	public static getOftenIdFrom(source: MediaItemSource, type: MediaItemType, id: string): Promise<string> {
		return new Promise<string> ( (resolve, reject) => {
			var url = `${FirebaseConfig.BaseURL}/idspace/${source}/${type}/${id}`;
			new Firebase(url).on('value', snap => {
				if (snap.exists()) {
					resolve(snap.val());
				} else {
					reject(new Error('id not found'));
				}
			});
		});
	}

	/**
	 * Registers a given provider id to the *idspace* collection where the value is the MediaItem often id
	 *
	 * @param providerId - given provider id
	 * @returns {Promise<Boolean|Error>} Resolves to a boolean or error if call fails
     */
	public registerToIdSpace(providerId: string) {
		IDSpace.instance.registerId(this, providerId);
	}

	// Getters
	get title(): string {
		return this.get('title');
	}

	get author(): string {
		return this.get('author');
	}

	get description(): string {
		return this.get('description');
	}

	get type(): MediaItemType {
		return this.get('type');
	}

	get source(): MediaItemSource {
		return this.get('source');
	}

	// Setters
	set title(value: string) {
		this.set('title', value);
	}

	set author(value: string) {
		this.set('author', value);
	}

	set description(value: string) {
		this.set('description', value);
	}

	set type(value: MediaItemType) {
		this.set('type', value);
	}

	set source(value: MediaItemSource) {
		this.set('source', value);
	}

	public toIndexingFormat(): IndexedObject {
		var data =  this.toJSON();
		data._id = data.id;
		data._index = this.source;
		data._score = data.score;
		data._type = this.type;
		return data;
	}
}

export default MediaItem;
