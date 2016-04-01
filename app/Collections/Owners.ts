import 'backbonefire';
import * as Backbone from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import * as Firebase from 'firebase';
import Owner from '../Models/Owner';
import logger from '../logger';

export default class Owners extends Backbone.Firebase.Collection<Owner> {
	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/owners`);
	}
}
