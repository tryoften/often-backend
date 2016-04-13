import MediaItemType from "../Models/MediaItemType";

export interface Indexable {
	toIndexingFormat(): Object;
}

export interface CommonIndexedFields {
	title?: string;
	author?: string;
	description?: string;
	text?: string;
	name?: string;
}

export interface IndexableObject extends CommonIndexedFields {
	_id: string;
	_type: MediaItemType;
	_index: string;
	_score: number;
	id?: string;
	type?: MediaItemType;
	index?: string;
	score?: number;
}
