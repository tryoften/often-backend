import 'backbonefire';
import * as Backbone from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import * as Firebase from 'firebase';
import User from '../Models/User';
import logger from '../logger';

export default class Users extends Backbone.Firebase.Collection<User> {
	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/users`);
	}
}
