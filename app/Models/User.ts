import { Firebase } from 'backbone';
import config from '../config';
import UserTokenGenerator from '../Auth/UserTokenGenerator';

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for users.
 */
class User extends Firebase.Model {

	initialize (data: any, options: any) {
		this.url = UserTokenGenerator.getAdminReference(`${config.firebase.BaseURL}/users/${data.user}`);
		this.autoSync = true;
		this.idAttribute = 'id';
	}

	/**
	 * Sets the authentication token on a user
	 * @param {string} token - SHA256 encoded string
	 *
	 * @return {void}
	 */
	setToken (token: string) {
		this.set('auth_token', token);
	}

}

export default User;
