export interface Indexable {
	toIndexingFormat(): Object;
}

export interface CommonIndexedFields {
	title: string;
	author: string;
	description: string;
}

export interface IndexedObject extends CommonIndexedFields {
	_id: string;
	_type: string;
	_index: string;
	_score: number;
}
