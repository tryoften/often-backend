import { firebase as FirebaseConfig } from '../config';
import MediaItem from "./MediaItem";
import MediaItemType from "./MediaItemType";

export interface FeaturedAttributes {
	type: MediaItemType;
	id: string;
}

class Featured extends MediaItem {
//Use a collection instead like Owners

	constructor(attributes: FeaturedAttributes, options: any = {autoSync: false, deepSync: false, setObjectMap: false}) {

		if (!attributes.type) {
			throw new Error('Type must be defined in featured attributes.');
		}

		if (!attributes.id) {
			throw new Error('ItemId must be defined in featured attributes');
		}

		super(attributes, options);
	}

	get type(): string {
		return this.get('type');
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/featured/${this.get('type')}/${this.id}`);
	}




}

export default Featured;
