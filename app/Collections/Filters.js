import 'backbonefire';
import _ from 'underscore';
import { firebase as FirebaseConfig } from '../config';
import { Firebase } from 'backbone';
import Filter from '../Models/Filter';

class Filters extends Firebase.Collection {

	constructor (models = [], options = {}) {
		let opts = _.defaults(options, {
			model: Filter
		});
		super(models, opts);
	}

	initialize (models, opts) {
		this.url = `${FirebaseConfig.BaseURL}/filters`;
	}
}

export default Filters;