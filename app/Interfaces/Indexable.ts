export interface Indexable {
	toIndexingFormat(): Object;
}

export interface CommonIndexedFields {
	title: string;
	author: string;
	description: string;
	text?: string;
	name?: string;
}

export interface IndexableObject extends CommonIndexedFields {
	_id: string;
	_type: string;
	_index: string;
	_score: number;
	category_id?: string;
	category_name?: string;
}
