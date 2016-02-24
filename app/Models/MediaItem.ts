import BaseModel from './BaseModel';
import MediaItemType from './MediaItemType';
import MediaItemSource from './MediaItemSource';
import { generate as generateId } from 'shortid';
import { Indexable, IndexableObject } from '../Interfaces/Indexable';
import IDSpace from './IDSpace';
import Firebase = require('firebase');
import { firebase as FirebaseConfig } from '../config';
import * as _ from 'underscore';

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
	imageQueue: Firebase;
	/**
	 * Designated constructor
	 *
	 * @param attributes
	 * @param options
     */
	constructor(attributes: MediaItemAttributes, options?: any) {
		if (!attributes.id) {
			attributes.id = generateId();
		}

		if (!attributes.score) {
			attributes.score = 0.0;
		}
		this.autoSync = true;
		this.imageQueue = new Firebase(`${FirebaseConfig.BaseURL}/queues/image_resizing/tasks`);

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

			var model: typeof MediaItemClass;
			IDSpace.instance.getOftenIdFrom(source, type, providerId).then(oftenId => {
				console.log(`Found often id for ${source}:${type}:${providerId} = ${oftenId}`);
				model = new MediaItemClass({source, type, id: oftenId});
				resolve(model);
			}).catch(err => {
				console.log(`Often id not found for ${source}:${type}:${providerId}, creating new model`);
				model = new MediaItemClass({ source, type });
				IDSpace.instance.registerId(model, providerId);
				model.save();
				resolve(model);
			});

		});
	}

	public imageProperties(): string[] {
		return ['image_url'];
	}

	public resizeImages() {
		let imageFields = _.intersection(Object.keys(this.attributes), this.imageProperties());
		this.imageQueue.push({
			option: 'mediaitem',
			id: this.id,
			type: this.type,
			imageFields: imageFields
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
	get type(): MediaItemType {
		return this.get('type');
	}

	get score(): number {
		return this.get('score');
	}

	get source(): MediaItemSource {
		return this.get('source');
	}

	get images(): Object {
		return this.get('images') || {};
	}

	// Setters
	set type(value: MediaItemType) {
		this.set('type', value);
	}

	set source(value: MediaItemSource) {
		this.set('source', value);
	}

	set score(value: number) {
		this.set('score', value);
	}

	public toIndexingFormat(): IndexableObject {
		var data =  {
			_id: this.id,
			_index: (this.source || '').toString(),
			_score: this.score || 0,
			_type: (this.type || '').toString(),
			id: this.id,
			title: this.get('title') || '',
			type: (this.type || '').toString(),
			description: this.get('description') || '',
			author: this.get('author') || ''
		};

		return data;
	}
}

export default MediaItem;
