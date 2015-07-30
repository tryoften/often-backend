import 'backbonefire';
import { Firebase } from 'backbone';
import { BaseURL } from '../config';
import User from '../Models/User';

class Users extends Firebase.Collection {
	initialize(models, opts) {
		this.model = User;
		this.url = `${BaseURL}/users`;
		this.autoSync = true;
	}

}

export default Users;
export var users = new Users();