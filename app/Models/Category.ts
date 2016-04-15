import BaseModel from './BaseModel';
import { firebase as FirebaseConfig } from '../config';
import IDSpace from '../Models/IDSpace';
import MediaItemSource from '../Models/MediaItemSource';
import MediaItemType from '../Models/MediaItemType';
import Lyric from './Lyric';
import LyricAttributes from "./Lyric";
import { generate as generateId } from 'shortid';

export interface CategoryAttributes {
	id?: string;
	name?: string;
	image?: {
		small_url?: string;
		large_url?: string;
	};
}

/**
 * Model that represents a category which can be assigned to a lyric or medium (quotes)
 */
class Category extends BaseModel {

	constructor(attributes: any = {}, opts?: any) {
		if (!attributes.id) {
			attributes.id = generateId();
		}
		attributes.type = 'category';
		attributes.setObjectMap = true;
		super(attributes, opts);

	}

	defaults(): Backbone.ObjectHash {
		return {
			name: '',
			image: {
				small_url: 'http://placehold.it/200x200',
				large_url: 'http://placehold.it/400x400'
			}
		};
	}

	get url(): string {
		return `${FirebaseConfig.BaseURL}/categories/${this.id}`;
	}

	get name(): string {
		return this.get('name');
	}

	get image(): any {
		return this.get('image') || {};
	}

	public getTargetObjectProperties(): any {
		return {
			id: this.id,
			name: this.name,
			image: this.image
		};
	}

	/**
	 * Adds a lyric to the category in question and updates all the appropriate models
	 * @param lyric
     */
	addLyric(lyric: LyricAttributes): any {
		let lyricRef = new Firebase(`${this.url}/lyrics/${lyric.id}`);
		lyricRef.set(true);

		let lyricModel = new Lyric(lyric);
		return lyricModel.syncData().then(() => {
			return IDSpace.instance.getOftenIdFrom(MediaItemSource.Genius, MediaItemType.track, lyricModel.get('track_genius_id'))
				.then(trackOftenId => {
					let updateObject: any = {};
					let category = {
						id: this.id,
						name: this.get('name')
					};
					updateObject[`lyrics/${lyric.id}/category`] = category;
					updateObject[`tracks/${trackOftenId}/lyrics/${lyric.id}/category`] = category;

					new Firebase(FirebaseConfig.BaseURL).update(updateObject);
					return category;
				});
		});
	}

	toIndexingFormat(): any {
		return {
			id: this.id,
			image: this.image,
			name: this.name
		};
	}
}

export default Category;
