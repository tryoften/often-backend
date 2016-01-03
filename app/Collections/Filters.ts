import 'backbonefire';
import * as _ from 'underscore';
import config from '../config';
import { Firebase } from 'backbone';
import Filter from '../Models/Filter';
import UserTokenGenerator from '../Auth/UserTokenGenerator';

class Filters extends Firebase.Collection<Filter> {

	constructor (models: Filter[] = [], options: any = {}) {
		let opts = _.defaults(options, {
			model: Filter
		});
		super(models, opts);
	}

	initialize (models: Filter[], opts: any) {
		this.url = UserTokenGenerator.getAdminReference(`${config.firebase.BaseURL}/filters`);
	}
}

export default Filters;
