import MediaItem from "./MediaItem";
import { firebase as FirebaseConfig } from '../config';

export default class Owner extends MediaItem {

	defaults(): Backbone.ObjectHash {
		return {
			name: '',
			image: {
				small_url: 'http://placehold.it/200x200',
				large_url: 'http://placehold.it/400x400'
			}
		};
	}

	get name(): string {
		return this.get('name');
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/owners/${this.id}`);
	}
}
