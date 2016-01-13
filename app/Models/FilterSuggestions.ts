import * as _ from 'underscore';

export interface Filterable {
	id: string,
	image: string,
	text: string;
	type: string;
}

export class FilterSuggestion {
	text: string;
	options: Filterable[];

	constructor (text, options) {
		this.text = text;
		if (_.isEmpty(options)) {
			this.options = [];
		}
	}
}
