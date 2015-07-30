import 'backbonefire';
import { Firebase } from 'backbone';
import { BaseURL } from '../config';
import ClientRequest from '../Models/ClientRequest';

class ClientRequests extends Firebase.Collection {
	initialize(models, opts) {
		this.model = ClientRequest;
		this.url = `${BaseURL}/client-requests`;
		this.autoSync = true;
	}
}

export default ClientRequests;
