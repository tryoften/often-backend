import * as Firebase from 'firebase';
import { firebase as FirebaseConfig } from '../config';
import BaseModel from '../Models/BaseModel';
import Subscription, { SubscriptionAttributes } from '../Models/Subscription';
import Pack, { PackAttributes } from '../Models/Pack';
import MediaItemType from './MediaItemType';
import BaseModelType from './BaseModelType';
import MediaItemSource from "./MediaItemSource";

export interface UserAttributes {
	name?: string;
	firstName: string;
	isAdmin: boolean;
	image: {
		small_url: string;
		large_url: string;
	};
}

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for users.
 */
class User extends BaseModel {

	constructor(attributes: any = {}, options?: any) {
		attributes.type = BaseModelType.user;
		super(attributes, options);
	}

	defaults(): Backbone.ObjectHash {
		return {
			type: BaseModelType.user,
			shareCount: 0,
			image: {
				small_url: 'http://placehold.it/200x200',
				large_url: 'http://placehold.it/400x400'
			}
		};
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

	get firstName() {
		return this.get('first_name');
	}

	get favoritesPackId() {
		return this.get('favoritesPackId');
	}

	get recentsPackId() {
		return this.get('recentsPackId');
	}

	get isAdmin() {
		return this.get('isAdmin');
	}

	get shareCount(): number {
		return this.get('shareCount') || 0;
	}

	/**
	 * Initializes a favorites pack
	 * @returns {Promise<string>} - Promise resolving to a pack id or an error.
	 */
	initFavoritesPack(): Promise<string> {
		var favoritesPackAttributes: PackAttributes = {
			name: this.firstName ? `${this.firstName}'s Favorites` : 'Your Favorites',
			description: this.firstName ? `${this.firstName}'s favorite selections` : 'Your favorite selections',
			published: false,
			type: MediaItemType.pack,
			source: MediaItemSource.Often,
			setObjectMap: true,
			shareCount: 0,
			premium: false,
			price: 0.0,
			image: {
				small_url: this.get('profile_pic_large') || this.get('profileImageLarge') || '',
				large_url: this.get('profile_pic_small') || this.get('profileImageSmall') || ''
			},
			items: [],
			isFavorites: true,
			isRecents: false
		};

		return new Promise((resolve, reject) => {
			if (!this.favoritesPackId) {
				this.addPack(favoritesPackAttributes).then((addedPack) => {
					this.save({
						favoritesPackId: addedPack.id
					});
					resolve(addedPack.id);
				});
			} else {
				resolve(this.favoritesPackId);
			}
		});
	}

	getTargetObjectProperties(): UserAttributes {
		return {
			name: this.get('name'),
			firstName: this.firstName || "",
			isAdmin: !!this.isAdmin,
			image: this.get('image')
		};
	}

	/**
	 * Initializes a recents pack for a user
	 * @returns {Promise<string>} - Promise resolving to a pack id or an error.
	 */
	initRecentsPack(): Promise<string> {
		var recentsPackAttributes: PackAttributes = {
			name: this.firstName ? `${this.firstName}'s Recents` : 'Your Recents',
			description: this.firstName ? `${this.firstName}'s recents selections` : 'Your recents selections',
			published: false,
			type: MediaItemType.pack,
			source: MediaItemSource.Often,
			setObjectMap: true,
			premium: false,
			price: 0.0,
			image: {
				small_url: this.get('profile_pic_large') || this.get('profileImageLarge') || '',
				large_url: this.get('profile_pic_small') || this.get('profileImageSmall') || ''
			},
			items: [],
			isFavorites: false,
			isRecents: true
		};

		return new Promise((resolve, reject) => {
			if (!this.recentsPackId) {
				this.addPack(recentsPackAttributes).then((addedPack) => {
					this.save({
						recentsPackId: addedPack.id
					});
					resolve(addedPack.id);
				});
			} else {
				resolve(this.recentsPackId);
			}
		});
	}

	/**
	 * Initializes a default pack
	 * @returns {Promise<string>} - Promise resolving to a pack id or an error.
	 */
	initDefaultPack(): Promise<string> {
		var defaultPackAttributes: PackAttributes = {
			id: 'EJDW_ze1-' // DJ Khaled Pack for now
		};

		return this.addPack(defaultPackAttributes).then( (addedPack) => {
			return addedPack.id;
		});
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
	public addPack (packAttributes: PackAttributes, subscriptionAttributes: SubscriptionAttributes = {}): Promise<Pack> {

		var pack = new Pack(packAttributes);
		return new Promise<any>((resolve, reject) => {

			subscriptionAttributes.userId = this.id;
			subscriptionAttributes.itemId = pack.id;
			subscriptionAttributes.mediaItemType = MediaItemType.pack;

			let packSubscription = new Subscription(subscriptionAttributes);

			packSubscription.syncData().then(() => {

				/* If pack subscription doesn't have timeSubscribed defined, then subscribe the user */
				if (!packSubscription.timeSubscribed) {
					packSubscription.subscribe();
					this.setSubscription(packSubscription);
				}

				/* If for whatever reason the pack is not set on user then restore it */
				if (!this.packSubscriptions[packSubscription.id]) {
					packSubscription.updateTimeLastRestored();
					this.setSubscription(packSubscription);
				}

				return pack.syncData();
			}).then(() => {
				this.setPack(pack);
				pack.setTarget(this, `/users/${this.id}/packs/${pack.id}`);
				pack.save();
				resolve(pack);
			}).catch((err: Error) => {
				reject(err);
			});
		});


	}

	/**
	 * Removes a pack from a user model
	 * @param packSubAttrs {SubscriptionAttributes} - object containing subscription data
	 * @returns {Promise<string>} - Returns a promise that resolves to packId that was removed or to an error when rejected
	 */
	public removePack (packId: string): Promise<string> {
		return new Promise<any>((resolve, reject) => {
			var pack = new Pack({id: packId});
			pack.syncData().then( () => {
				pack.unsetTarget(this, `/users/${this.id}/packs/${pack.id}`);
				this.unsetPack(packId);
				resolve(packId);
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
