import MediaItem from "./MediaItem";
import { firebase as FirebaseConfig } from '../config';
import {IndexableObject} from "../Interfaces/Indexable";

export default class Owner extends MediaItem {

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

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/owners/${this.id}`);
	}
}
