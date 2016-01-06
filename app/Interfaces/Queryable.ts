export interface Queryable {
	text: string,
	user: string,
	time_made: number,
	autocomplete: boolean,
	toQueryFormat(): Object;
}
