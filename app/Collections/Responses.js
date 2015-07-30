import 'backbonefire';
import { Firebase } from 'backbone';
import { BaseURL } from '../config';
import Response from '../Models/Response';

class Responses extends Firebase.Collection {
	initialize(models, opts) {
		this.model = Response;
		this.url = `${BaseURL}/responses`;
		this.autoSync = true;
	}

}

export default Responses;