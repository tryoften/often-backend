///<reference path="../../typings/firebase/firebase.d.ts" />

import FirebaseTokenGenerator from 'firebase-token-generator';
import config from '../config';
import * as Firebase from 'firebase';
import logger from '../Models/Logger';

/**
 * This singleton class is responsible for generating authentication tokens for user accounts
 */
class UserTokenGenerator {
	tokenGenerator: FirebaseTokenGenerator;

	/**
	 * Initializes the user token generator class
	 */
	constructor () {
		this.tokenGenerator = new FirebaseTokenGenerator(config.firebase.Secret);
	}
	
	/**
	 * Generates an authentication token for a user
	 * @param {string} uid - id of a user for whom to create an authentication token for
	 * @param {object} data - arbitrary data object
	 *
	 * @return {object} - authentication token
	 */
	generateToken (uid: string, data: any) {
		return this.tokenGenerator.createToken({ 
			uid: uid, 
			data: data
		});
	}

	/**
	 * Authenticates and returns a firebase reference to a passed in endpoint with admin privileges
	 * @param {string} url - Firebase url endpoint
	 *
	 * @return {object} - Return authenticated firebase reference
	 */
	getAdminReference (url: string) {
		var ref = new Firebase(url);
		ref.authWithCustomToken(config.firebase.Secret, (error, result) => {
			if (error) {
				logger.error("Authentication failed for: " + url);
			} else {
				logger.info("Authentication succesful for: " + url);
			}
		});
		return ref;
	}

}

export default new UserTokenGenerator();
