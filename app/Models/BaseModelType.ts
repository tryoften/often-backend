import * as _ from 'underscore';
import MediaItemType from '../Models/MediaItemType';
export default class BaseModelType extends String {

	static category: BaseModelType = 'category';

	static allTypes: BaseModelType[] = _.union(MediaItemType.allTypes, BaseModelType.category);

	private static mapping: any;
	static get classMapping(): any {
		if (!BaseModelType.mapping) {
			BaseModelType.mapping = _.extend(MediaItemType.classMapping, {
				category: require('./Category').default
			});
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
