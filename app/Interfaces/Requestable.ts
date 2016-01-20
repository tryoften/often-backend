import {QueryData} from './Queryable';
import RequestType from '../Models/RequestType';
import MediaItemSource from '../Models/MediaItemSource';
export interface Requestable {
	id: string;
	userId: string;
	creation_time?: number;
	query: QueryData;
	type: RequestType;
}
