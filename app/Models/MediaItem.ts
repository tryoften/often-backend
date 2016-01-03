import BaseModel from "./BaseModel";

/**
 * Base model for media items. Includes all the metadata to query object
 */
class MediaItem extends BaseModel implements Indexable {
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

	type: MediaItemType;
	source: MediaItemSource;

	toIndexingFormat(): Object {
		return this.toJSON();
	}
}

export enum MediaItemType {

};

export enum MediaItemSource {

};

export default MediaItem;
