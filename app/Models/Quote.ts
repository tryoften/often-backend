import MediaItem, { MediaItemAttributes } from "./MediaItem";
import { firebase as FirebaseConfig } from '../config';
import { IndexableObject } from '../Interfaces/Indexable';
import { ObjectHash } from 'backbone';
import MediaItemType from "./MediaItemType";
import MediaItemSource from "./MediaItemSource";
import * as _ from 'underscore';

export interface QuoteAttributes extends MediaItemAttributes {
	id?: string;
	origin?: string;
	owner_id?: string;
	owner_name?: string;
	text?: string;
}

export default class Quote extends MediaItem {
	constructor(attributes?: QuoteAttributes, options?: any) {
		super(attributes, options);
	}

	defaults(): ObjectHash {
		return {
			source: MediaItemSource.Often,
			type: MediaItemType.quote
		};
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/owners/${this.get('owner_id')}/quotes/${this.id}`);
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
			owner_id: this.get('owner_id') || '',
			owner_name: this.get('owner_name') || '',
			origin: this.get('origin') || '',
			author: this.author || '',
			description: this.text || '',
			text: this.text || '',
			images: this.images
		}, super.toIndexingFormat());
	}
}
