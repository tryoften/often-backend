import MediaItem from "./MediaItem";
import { IndexableObject } from "../Interfaces/Indexable";

class Pack extends MediaItem {
	get url(): Firebase {
		return Firebase(`http://often-dev.firebaseio.com/packs/${this.id}`);
	}

	get name(): string {
		return this.get('name');
	}

	set name(value: string) {
		this.set('name', value);
	}

	get items(): IndexableObject[] {
		return this.get('items');
	}

	addItem(item: MediaItem) {
		var itemObj = item.toJSON();

		var items = this.items;
		items.push(itemObj);

		this.save({items});
	}
}
