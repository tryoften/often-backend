import { firebase as FirebaseConfig } from '../config';
import BaseModel from './BaseModel';
import MediaItemType from './MediaItemType';
import { IndexableObject, Indexable } from '../Interfaces/Indexable';

class SubscriptionType extends String {
	static free: SubscriptionType = 'free';
	static premium: SubscriptionType = 'premium';
}

export interface SubscriptionAttributes {
	id?: string;
	mediaItemType?: MediaItemType;
	itemId: string;
	userId?: string;
	subscriptionType?: SubscriptionType;
	timeLastUpdated?: number;
	timeLastRestored?: number;
	timeSubscribed?: number;
}

interface IndexableSubscription extends IndexableObject, SubscriptionAttributes {};


class Subscription extends BaseModel implements Indexable {

	/**
	 * Designated constructor
	 *
	 * @param attributes {PackAttributes
	 * @param options
	 */
	constructor(attributes: SubscriptionAttributes, options?: any) {

		if (!attributes.itemId || !attributes.userId) {
			throw new Error('PackId and UserId must be defined to instantiate a packsubscription model');
		}

		if (!attributes.mediaItemType) {
			throw new Error('MediaItemType must be defined on subscription attributes.');
		}

		attributes.id = `${attributes.itemId}:${attributes.userId}`;

		attributes.timeLastUpdated = Date.now();

		super(attributes, options);
		this.save();
	}

	/* Getters */
	get userId() {
		return this.get('userId');
	}

	get itemId() {
		return this.get('itemId');
	}

	get mediaItemType() {
		return this.get('mediaItemType');
	}

	get timeLastUpdated() {
		return this.get('timeLastUpdated');
	}

	get subscriptionType() {
		return this.get('subscriptionType');
	}

	get timeSubscribed() {
		return this.get('timeSubscribed');
	}

	get timeLastRestored() {
		return this.get('timeLastRestored');
	}

	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/subscriptions/${this.mediaItemType}/${this.itemId}/${this.userId}/${this.id}`);
	}

	/**
	 * Populates the subscription object with subscription information
	 * @param {SubscriptionAttributes} subAttrs - Object containing subscription information
	 */
	subscribe (subAttrs: SubscriptionAttributes) {
		this.save({
			timeSubscribed: subAttrs.timeSubscribed || Date.now(),
			subscriptionType: subAttrs.subscriptionType || SubscriptionType.free,
			timeLastUpdated: Date.now()
		});
	}

	/**
	 * Udates the time at which the subscription information has been restored by the user.
	 */
	updateTimeLastRestored() {
		this.save({
			timeLastRestored: Date.now(),
			timeLastUpdated: Date.now()
		});
	}


	/**
	 * Transforms a subscription model into an indexable format
	 *
	 * @returns {IndexableSubscription} - Returns an indexable subscription item
	 */
	toIndexingFormat(): IndexableSubscription {

		return {
			_index: 'subscription',
			_type: (this.mediaItemType || '').toString(),
			_id: (this.id || '').toString(),
			_score: 0,
			title: '',
			author: '',
			description: '',
			id: (this.id || '').toString(),
			itemId: (this.itemId || '').toString(),
			userId: (this.userId || '').toString(),
			mediaItemType: (this.mediaItemType || '').toString(),
			subscriptionType: (this.subscriptionType || '').toString(),
			timeSubscribed: this.timeSubscribed || 0,
			timeLastUpdated: this.timeLastUpdated || 0,
			timeLastRestored: this.timeLastRestored || 0
		};
	}

}

export default Subscription;
