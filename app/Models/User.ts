import * as Firebase from 'firebase';
import { firebase as FirebaseConfig } from '../config';
import BaseModel from '../Models/BaseModel';
import Subscription, { SubscriptionAttributes } from '../Models/Subscription';
import Pack from '../Models/Pack';
import MediaItemType from "./MediaItemType";

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for users.
 */
class User extends BaseModel {



	constructor(attributes: any = {}, options?: any) {
		attributes.type = 'user';
		super(attributes, options);
	}

	/* Getters */
	get url(): Firebase {
		return new Firebase(`${FirebaseConfig.BaseURL}/users/${this.id}`);
	}

	get packs() {
		return this.get('packs') || {};
	}

	get packSubscriptions() {
		return this.get('pack_subscriptions') || {};
	}


	/**
	 * Sets the authentication token on a user
	 * @param {string} token - SHA256 encoded string
	 *
	 * @return {void}
	 */
	public setToken (token: string) {
		this.set('auth_token', token);
	}


	/**
	 * Instantiates a pack and adds it to the user's pack collection
	 * @param packSubAttrs {SubscriptionAttributes} - Object containing pack subscription information
	 * @returns {Promise<string>} - Returns a promise that resolves to a success message or to an error when rejected
	 */
	public addPack (packSubAttrs: SubscriptionAttributes): Promise<string> {

		if (!packSubAttrs.mediaItemType) {
			packSubAttrs.mediaItemType = MediaItemType.pack;
		}

		var pack = new Pack({id: packSubAttrs.itemId});
		return new Promise<any>((resolve, reject) => {

			let packSubscription = new Subscription({
				type: 'subscription',
				userId: this.id,
				itemId: packSubAttrs.itemId,
				mediaItemType: packSubAttrs.mediaItemType
			});

			packSubscription.syncData().then(() => {

				/* If pack subscription doesn't have timeSubscribed defined, then subscribe the user */
				if (!packSubscription.timeSubscribed) {
					packSubscription.subscribe(packSubAttrs);
					this.setSubscription(packSubscription);
				}

				/* If for whatever reason the pack is not set on user then restore then restore it */
				if (!this.packSubscriptions[packSubscription.id]) {
					packSubscription.updateTimeLastRestored();
					this.setSubscription(packSubscription);
				}

				return pack.syncData();
			}).then(() => {
				this.setPack(pack);
				pack.setTarget(this, `/users/${this.id}/packs/${pack.id}`);
			}).catch((err: Error) => {
				reject(err);
			});
		});


	}

	/**
	 * Removes a pack from a user model
	 * @param packSubAttrs {SubscriptionAttributes} - object containing subscription data
	 * @returns {Promise<string>} - Returns a promise that resolves to a success message or to an error when rejected
	 */
	public removePack (packSubAttrs: SubscriptionAttributes): Promise<string> {
		return new Promise<any>((resolve, reject) => {
			var pack = new Pack({id: packSubAttrs.itemId});
			pack.syncData().then( () => {
				pack.unsetTarget(this, `/users/${this.id}/packs/${pack.id}`);
				this.unsetPack(packSubAttrs.itemId);
				resolve(`PackId ${packSubAttrs.itemId} removed on user ${this.id}`);
			});
		});
	}

	/**
	 * Sets a subscription object on user's subscriptions if it hasn't been set yet
	 * @param sub {Subscriptions} - Subscription object
	 */
	private setSubscription (sub: Subscription) {
		let currentPackSubscriptions = this.packSubscriptions;
		if (!currentPackSubscriptions[sub.id]) {
			currentPackSubscriptions[sub.id] = sub.toIndexingFormat();
			this.save({ pack_subscriptions: currentPackSubscriptions });
		}
	}

	/**
	 * Sets a pack on user's packs
	 * @param pack {Pack} - Pack to be added
	 */
	private setPack (pack: Pack) {
		let currentPacks = this.packs;
		if (!currentPacks[pack.id]) {
			currentPacks[pack.id] = pack.toIndexingFormat();
			this.save({ packs: currentPacks });
		}
	}

	/**
	 * Unsets a pack on user's packs
	 * @param packId {string} - Unsets a pack on user's pack collection
	 */
	private unsetPack (packId: string) {
		let currentPacks = this.packs;
		if (currentPacks[packId]) {
			currentPacks[packId] = null;
			this.save({ packs: currentPacks });
		}
	}


}

export default User;
