import 'backbonefire';
import { Firebase } from 'backbone';
import { BaseURL } from '../config';
import User from '../Models/User';

/**
 * This class is responsible for maintaining the users collection.
 */
class Users extends Firebase.Collection {

	/**
	 * Initializes the users collection.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 *
	 * @return {void}
	 */
	initialize (models, opts) {

		this.model = User;
		this.url = `${BaseURL}/users`;
		this.autoSync = true;

	}

}

export default Users;
