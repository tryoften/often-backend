import 'backbonefire';
import * as _ from 'underscore';
import config from '../config';
import { Firebase } from 'backbone';
import Filter from '../Models/Filter';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import {FilterInfo} from '../Models/FilterInfo';
import {FilterSuggestion} from "../Models/FilterSuggestions";

class Filters extends Firebase.Collection<Filter> {

	constructor (models: Filter[] = [], options: any = {}) {
		let opts = _.defaults(options, {
			model: Filter
		});
		super(models, opts);
	}

	initialize (models: Filter[], opts: any) {
		this.url = UserTokenGenerator.getAdminReference(`${config.firebase.BaseURL}/filters`);
	}

	suggestFilters (filterInfo: FilterInfo): FilterSuggestion[] {

		if (filterInfo.value.length == 0) {
			/* If text is empty then return all filters */
			return [new FilterSuggestion(`#${filterInfo.value}`, this.toJSON())];
		}

		/* Otherwise return the ones that match the prefix of the passed in filter */
		var suggestions: FilterSuggestion[] = [];
		for (var filter of this.models) {
			if (filter.get("text").indexOf(filterInfo.value) === 0) {
				suggestions.push(filter.toJSON());
			}
		}
		return suggestions;
	}

}

export default Filters;
