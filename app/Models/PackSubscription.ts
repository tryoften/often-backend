import { firebase as FirebaseConfig } from '../config';
import BaseModel from './BaseModel';

class SubscriptionType extends String {
	static free: SubscriptionType = 'free';
	static premium: SubscriptionType = 'premium';
}

export interface PackSubscriptionAttributes {
	id?: string;
	userId: string;
	packId: string;
	subscriptionType?: SubscriptionType;
	timeSubscribed?: number;
}

class PackSubscription extends BaseModel {

	/**
	 * Designated constructor
	 *
	 * @param attributes {PackAttributes
	 * @param options
	 */
	constructor(attributes: PackSubscriptionAttributes, options?: any) {

		if (!attributes.packId || !attributes.userId) {
			throw new Error('PackId and UserId must be defined to instantiate a packsubscription model');
		}

		attributes.id = `${attributes.packId}_${attributes.userId}`;

		if (!attributes.subscriptionType) {
			/* If not defined, set default dsubscription type to free */
			attributes.subscriptionType = SubscriptionType.free;
		}

		if (!attributes.timeSubscribed) {
			/* If not defined, set default dsubscription type to free */
			attributes.timeSubscribed = Date.now();
		}

		super(attributes, options);
	}

	get userId() {
		return this.get('userId');
	}

	get packId() {
		return this.get('packId');
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/pack_subscriptions/${this.packId}/${this.userId}`);
	}

}

export default PackSubscription;
