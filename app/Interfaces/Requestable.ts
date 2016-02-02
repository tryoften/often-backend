import {QueryData} from './Queryable';
import RequestType from '../Models/RequestType';

export interface Requestable {
	id: string;
	userId: string;
	creation_time?: number;
	doneUpdating: boolean;
	ingestData: boolean;
	query: QueryData;
	type: RequestType;
}
