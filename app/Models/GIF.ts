import MediaItem, { MediaItemAttributes } from "./MediaItem";
import { firebase as FirebaseConfig } from '../config';
import MediaItemType from "./MediaItemType";
import MediaItemSource from "./MediaItemSource";
import { ObjectHash, ModelSetOptions, Model } from 'backbone';

export interface GIFAttributes extends MediaItemAttributes {
	id?: string;
	owner_id?: string;
	owner_name?: string;
	description?: string;
	tags?: string;
	giphy_id?: string;
	image?: {
		small_url?: string;
		medium_url?: string;
		large_url?: string;
	};
}

export class GIFSize extends String {
	static small: GIFSize = '100w';
	static medium: GIFSize = '200w';
	static large: GIFSize = 'giphy';
}

export default class GIF extends MediaItem {
	constructor(attributes?: GIFAttributes, options?: any) {
		super(attributes, options );
	}

	defaults(): ObjectHash {
		return {
			source: MediaItemSource.Often,
			type: MediaItemType.gif,
			giphy_id: 'h0MTqLyvgG0Ss'
		};
	}

	get image(): any {
		return {
			small_url: this.getGifURL(GIFSize.small),
			medium_url: this.getGifURL(GIFSize.medium),
			large_url: this.getGifURL(GIFSize.large)
		};
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/owners/${this.get('owner_id')}/gifs/${this.id}`);
	}

	set(obj: any, options?: ModelSetOptions): Model {
		console.log(obj);
		return super.set(obj, options);
	}

	getGifURL(size: GIFSize) {
		var id = this.get('giphy_id');
		return `http://media1.giphy.com/media/${id}/${size}.gif`;
	}

	toJSON(): Object {
		var obj = super.toJSON();
		obj.image = this.image;
		return obj;
	}
}
