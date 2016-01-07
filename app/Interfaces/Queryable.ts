export interface Queryable {
	text: string;
	filter?: string;
	toQueryFormat(): Object;
}
