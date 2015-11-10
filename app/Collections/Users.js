import 'backbonefire';
import { Firebase } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import User from '../Models/User';

/**
 * This class is responsible for maintaining the users collection.
 */
class Users extends Firebase.Collection {

	constructor () {
		let opts = {
			idAttribute: 'id',
			model: User,
			autoSync: true
		};
		super([], opts);
	}

	/**
	 * Initializes the users collection.
	 * @param {string} models - optional models for backbone
	 * @param {string} opts - optional options for backbone
	 *
	 * @return {void}
	 */
	initialize (models, opts) {
		this.url = `${FirebaseConfig.BaseURL}/users`;
	}

}

export default Users;
