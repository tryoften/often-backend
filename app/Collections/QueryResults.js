import 'backbonefire';
import { Firebase } from 'backbone';
import { BaseURL } from '../config';
import QueryResult from '../Models/QueryResult';

class QueryResults extends Firebase.Collection {
	initialize(models, opts) {
		this.model = QueryResult;
		this.url = `${BaseURL}/query-results`;
		this.autoSync = true;
	}

}

export default QueryResults;