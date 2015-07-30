import 'backbonefire';
import { Firebase } from 'backbone';
import { BaseURL } from '../config';

class QueryResult extends Firebase.Model {
	initialize(models, opts) {
		this.url = `${BaseURL}/query-results`;
		this.autoSync = true;
	}

}

export default QueryResult;