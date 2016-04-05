import * as Firebase from 'firebase';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import { firebase as FirebaseConfig } from '../config';
import BaseModel from '../Models/BaseModel';
import PackSubscription, { PackSubscriptionAttributes } from '../Models/PackSubscription';
import Pack from '../Models/Pack';

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for users.
 */
class User extends BaseModel {



	constructor(attributes: any = {}, options?: any) {
		super(attributes, options);
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/users/${this.id}`);
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

	get packs() {
		return this.get('packs') || {};
	}

	addPack (ups: PackSubscriptionAttributes): Promise<any> {

		return new Promise<any>((resolve, reject) => {
			var packId = ups.packId;
			var pack = new Pack({id: packId});
			if (this.packs[packId]) {
				console.log('User already subscribed to a pack');
				return;
			}
			var p = this.packs;
			p[packId] = pack.toIndexingFormat();
			this.set('packs', p);
			this.save();
			var packSubscription = new PackSubscription(ups);
			resolve(true);
		});


	}

	removePack (ups: PackSubscriptionAttributes) {

	}

}

export default User;
