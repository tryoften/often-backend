import * as _ from 'underscore';

export default class CommandType extends String {
	static listFilters: CommandType = 'filters-list';
	static topSearches: CommandType = 'top-seraches';
	static filteredSearch: CommandType = 'filtered-search';

	static allCommands: CommandType[] = [
		CommandType.listFilters,
		CommandType.topSearches,
		CommandType.filteredSearch
	];

	private static mapping: any;
	static get classMapping(): any {
		if (!CommandType.mapping) {
			CommandType.mapping = {
				listFilters: require('./ListFilters').default,
				topSearches: require('./TopSearches').default,
				filteredSearch: require('./FilteredSearch').default
			};
		}
		return CommandType.mapping;
	};

	/**
	 * Creates a MediaItemType object from its string representation
	 *
	 * @param str
	 * @returns {MediaItemType}
	 */
	static fromType(str: string): CommandType {
		if (!_.contains(CommandType.allCommands, str)) {
			throw new Error('Cannot create CommandType from passed in string. You must pass in one of the defined types');
		}
		return <CommandType>str;
	}

	static toClass(type: CommandType): any {
		return CommandType.classMapping[type.toString()];
	}
};
