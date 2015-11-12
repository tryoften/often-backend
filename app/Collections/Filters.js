import 'backbonefire';
import _ from 'underscore';
import { firebase as FirebaseConfig } from '../config';
import { Firebase } from 'backbone';
import Filter from '../Models/Filter';
import UserTokenGenerator from '../Auth/UserTokenGenerator';

class Filters extends Firebase.Collection {

	constructor (models = [], options = {}) {
		let opts = _.defaults(options, {
			model: Filter
		});
		super(models, opts);
	}

	initialize (models, opts) {
		this.url = UserTokenGenerator.getAdminReference(`${FirebaseConfig.BaseURL}/filters`);
	}
}

export default Filters;