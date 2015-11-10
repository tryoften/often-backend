import { Model } from 'backbone';

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for users.
 */
class User extends Model {

	/**
	 * Sets the authentication token on a user
	 * @param {string} token - SHA256 encoded string
	 *
	 * @return {void}
	 */
	setToken (token) {
		this.set("auth_token", token);
	}

}

export default User;