import * as React from 'react';
import * as Firebase from 'firebase';
import {firebase as FirebaseConfig } from '../../config';
import User, {UserAttributes} from '../../Models/User';


interface AuthData {
	token: string;
	userData: UserAttributes;
}

interface EmailPassword {
	email: string;
	password: string;
}

export default class Authenticator extends React.Component<{}, {}> {

	static rootRef = new Firebase(FirebaseConfig.BaseURL);

	static authWithProvider(provider: string): Promise<any> {
		let authPromise = new Promise((resolve, reject) => {
			this.rootRef.authWithOAuthPopup(provider, (err, authData) => {
				if (err) {
					reject(err);
				}

				if (authData) {
					resolve(authData);
				}
			});
		});
		return authPromise.then(() => { return this.getAndSetUserAuthData(); });
	}

	static authWithPassword(emailPassword: EmailPassword): Promise<any> {
		let authPromise = new Promise((resolve, reject) => {
			this.rootRef.authWithPassword(emailPassword, (err, authData) => {
				if (err) {
					reject(err);
				}

				if (authData) {
					resolve(authData);
				}
			});
		});

		return authPromise.then(() => { return this.getAndSetUserAuthData(); });
	}

	static getAuthorizedUser() {
		return User.fromString(localStorage.getItem('userData'));
	}

	static deauthorize() {
		this.rootRef.unauth();
		localStorage.removeItem('token');
		localStorage.removeItem('userData');
	}

	static isAuthorized() {
		return !!localStorage.getItem('token');
	}

	static getUserAuthData(): Promise<AuthData> {
		let user = this.rootRef.getAuth();

		let userObj = new User({id: user.uid});
		return userObj.syncData().then((syncedModel) => {

			if (!userObj.isAdmin) {
				throw new Error('User is not an admin');
			}

			if (!user.token) {
				throw new Error('Could not retrieve user token');
			}

			return {
				token: user.token,
				userData: userObj.getTargetObjectProperties()
			};


		});
	}

	static setUserAuthData(authData: AuthData): void {
		localStorage.setItem('token', authData.token);
		localStorage.setItem('userData', authData.userData.toString());
	}


	static getAndSetUserAuthData() {
		return this.getUserAuthData()
			.then((userAuthData: AuthData) => {
				this.setUserAuthData(userAuthData);
			});
	}


	render() {
		return (
			<h1>
				Authenticator
			</h1>
		);
	}
}

