import MediaItem, { MediaItemAttributes } from "./MediaItem";
import { firebase as FirebaseConfig } from '../config';
import {IndexableObject} from "../Interfaces/Indexable";
import MediaItemType from "./MediaItemType";

export interface OwnerAttributes extends MediaItemAttributes {
	name: string;
	image: {
		small_url: string;
		large_url: string;
	};
	quotes: { [key: string]: IndexableObject };
}

export default class Owner extends MediaItem {
	constructor (attributes: any = {}, options: any = {}) {
		attributes.type = MediaItemType.owner;
		super(attributes, options);
	}


	defaults(): Backbone.ObjectHash {
		return {
			name: '',
			type: MediaItemType.owner,
			image: {
				small_url: 'http://placehold.it/200x200',
				large_url: 'http://placehold.it/400x400'
			},
			quotes: {}
		};
	}

	get gifs(): { [key: string]: IndexableObject } {
		return this.get('gifs');
	}

	get quotes(): { [key: string]: IndexableObject } {
		return this.get('quotes');
	}

	get quotes_count(): number {
		return Object.keys(this.get('quotes')).length || 0;
	}

	get name(): string {
		return this.get('name');
	}

	set quotes(value: { [key: string]: IndexableObject }) {
		this.set('quotes', value);
	}

	set name(value: string) {
		this.set('name', value);
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/owners/${this.id}`);
	}
}
