export interface Indexable {
	toIndexingFormat(): Object;
}

export interface IndexedObject {
	_id: string;
	_type: string;
	_index: string;
	_score: number;
}
