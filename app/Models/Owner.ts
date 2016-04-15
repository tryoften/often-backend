import MediaItem, { MediaItemAttributes } from "./MediaItem";
import { firebase as FirebaseConfig } from '../config';
import {IndexableObject} from "../Interfaces/Indexable";

export interface OwnerAttributes extends MediaItemAttributes {
	name: string;
	image: {
		small_url: string;
		large_url: string;
	};
	quotes: { [key: string]: IndexableObject };
}

export default class Owner extends MediaItem {

	constructor (attributes?: any, options?: any) {
		attributes.type = 'owner';
		super(attributes, options);
	}

	defaults(): Backbone.ObjectHash {
		return {
			name: '',
			image: {
				small_url: 'http://placehold.it/200x200',
				large_url: 'http://placehold.it/400x400'
			},
			quotes: {}
		};
	}

	get quotes(): { [key: string]: IndexableObject } {
		return this.get('quotes');
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
