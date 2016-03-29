import Pack from '../Models/Pack';
import * as Backbone from 'backbone';
import * as Firebase from 'firebase';
import { firebase as FirebaseConfig } from '../config';

export default class Packs extends Backbone.Firebase.Collection<Pack> {
	constructor() {
		super([], {
			model: Pack,
			autoSync: true
		});
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/packs`);
	}
}
