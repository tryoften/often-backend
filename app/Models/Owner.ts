import MediaItem from "./MediaItem";
import { firebase as FirebaseConfig } from '../config';

export default class Owner extends MediaItem {
	get name(): string {
		return this.get('name');
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/owners/${this.id}`);
	}
}
