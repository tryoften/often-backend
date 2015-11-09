import FirebaseTokenGenerator from 'firebase-token-generator';
import { firebase as FirebaseConfig } from '../config';

/**
 * This singleton class is responsible for generating authentication tokens for user accounts
 */
class UserTokenGenerator {

	/**
	 * Initializes the user token generator class
	 */
	constructor () {
		this.tokenGenerator = new FirebaseTokenGenerator(FirebaseConfig.Secret);
	}
	
	/**
	 * Generates an authentication token for a user
	 * @param {string} uid - id of a user for whom to create an authentication token for
	 * @param {object} data - arbitrary data object
	 *
	 * @return {object} - authentication token
	 */
	generateToken (uid, data) {
		return this.tokenGenerator.createToken({ 
			uid: uid, 
			data: data
		});
	}

}

export default new UserTokenGenerator();