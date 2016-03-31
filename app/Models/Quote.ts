import MediaItem from "./MediaItem";
import { firebase as FirebaseConfig } from '../config';
import { IndexableObject } from '../Interfaces/Indexable';
import { ObjectHash } from 'backbone';
import MediaItemType from "./MediaItemType";
import MediaItemSource from "./MediaItemSource";
import * as _ from 'underscore';

export default class Quote extends MediaItem {

	constructor(attributes?: any, options?: any) {
		super(attributes, options);
	}

	defaults(): ObjectHash {
		return {
			source: MediaItemSource.Often,
			type: MediaItemType.quote
		};
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/quotes/${this.id}`);
	}

	get text(): string {
		return this.get('text');
	}

	set text(value: string) {
		this.set('text', value);
	}

	get author(): string {
		return this.get('author');
	}

	set author(value: string) {
		this.set('author', value);
	}

	get title(): string {
		return this.get('title');
	}

	set title(value: string) {
		this.set('title', value);
	}

	public toIndexingFormat(): IndexableObject {
		return _.extend({
			title: this.title || '',
			author: this.author || '',
			description: this.text || '',
			text: this.text || '',
			images: this.images
		}, super.toIndexingFormat());
	}
}
