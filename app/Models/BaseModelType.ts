import * as _ from 'underscore';

export default class BaseModelType extends String {
	static artist: BaseModelType = 'artist';
	static track: BaseModelType = 'track';
	static lyric: BaseModelType = 'lyric';
	static pack: BaseModelType = 'pack';
	static quote: BaseModelType = 'quote';
	static category: BaseModelType = 'category';
	static user: BaseModelType = 'user';

	static allTypes: BaseModelType[] = [
		BaseModelType.artist,
		BaseModelType.track,
		BaseModelType.lyric,
		BaseModelType.pack,
		BaseModelType.quote,
		BaseModelType.category,
		BaseModelType.user
	];

	private static mapping: any;
	static get classMapping(): any {
		if (!BaseModelType.mapping) {
			BaseModelType.mapping = {
				artist: require('./Artist').default,
				track: require('./Track').default,
				lyric: require('./Lyric').default,
				pack: require('./Pack').default,
				quote: require('./Quote').default,
				category: require('./Category').default,
				user: require('./User').default
			};
		}
		return BaseModelType.mapping;
	};

	/**
	 * Creates a MediaItemType object from its string representation
	 *
	 * @param str
	 * @returns {MediaItemType}
	 */
	static fromType(str: string): BaseModelType {
		if (!_.contains(BaseModelType.allTypes, str)) {
			throw new Error('Cannot create BaseModel from passed in string. You must pass in one of the defined types');
		}
		return <BaseModelType>str;
	}

	static toClass(type: BaseModelType): any {
		return BaseModelType.classMapping[type.toString()];
	}
};
