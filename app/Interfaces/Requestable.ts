import {QueryData} from './Queryable';
import RequestType from '../Models/RequestType';

export interface Requestable {
	id: string;
	query: QueryData;
	type: RequestType;
	userId?: string;
	creation_time?: number;
	doneUpdating?: boolean;
	ingestData?: boolean;
}
