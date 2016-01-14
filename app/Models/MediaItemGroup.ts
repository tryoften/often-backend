import MediaItemType from './MediaItemType';

export class MediaItemGroup {
	results: any;
	type: MediaItemType;
	constructor(type, items) {
		this.type = type;
		this.results = items;
	}
}
