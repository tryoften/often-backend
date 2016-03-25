import MediaItemType from './MediaItemType';
import MediaItem from "./MediaItem";
import { IndexableObject } from "../Interfaces/Indexable";

export default class MediaItemGroup {
	results: IndexableObject[];
	type: MediaItemType;

	constructor(type, items) {
		this.type = type;
		this.results = items;
	}
}
