import { firebase as FirebaseConfig } from '../config';
import * as _ from 'underscore';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import Worker, { Task } from './Worker';
import { SubscriptionAttributes, MediaItemType, MediaItemAttributes, Pack, User } from '@often/often-core';

class UserWorkerTaskType extends String {
	static EditUserPackItems: UserWorkerTaskType = 'editUserPackItems';
	static EditUserPackSubscription: UserWorkerTaskType = 'editPackSubscription';
	static InitiatePacks: UserWorkerTaskType = 'initiatePacks';
	static CreateToken: UserWorkerTaskType = 'createToken';
}

class UserPackOperation extends String {
	static add: UserPackOperation = 'add';
	static remove: UserPackOperation = 'remove';
}

class UserPackType extends String {
	static favorite: UserPackType = 'favorite';
	static recent: UserPackType = 'recent';
}

interface EditUserPackItemsAttributes {
	operation: UserPackOperation;
	packType: UserPackType;
	mediaItem: MediaItemAttributes;
}

interface EditUserPackSubscriptionAttributes {
	packId: string;
	operation: UserPackOperation;
	subscriptionInfo?: SubscriptionAttributes;
}

interface CreateTokenAttributes {}

interface UserWorkerTask extends Task {
	userId: string;
	type: UserWorkerTaskType;
	data?: (EditUserPackItemsAttributes | EditUserPackSubscriptionAttributes | CreateTokenAttributes);
}

/* Adding / Removing Items from favorites and recents  */
class UserWorker extends Worker {
	constructor (opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.queues.user);
		super(options);
	}

	public process (task: UserWorkerTask, progress: Function, resolve: Function, reject: Function) {
		let user = new User({id: task.userId});
		user.syncData().then(() => {
			switch (task.type) {
				case UserWorkerTaskType.EditUserPackItems:
					return this.editUserPackItems(user, <EditUserPackItemsAttributes>task.data);

				case UserWorkerTaskType.EditUserPackSubscription:
					return this.editUserPackSubscription(user, <EditUserPackSubscriptionAttributes>task.data);

				case UserWorkerTaskType.InitiatePacks:
					return this.initiatePacks(user);

				case UserWorkerTaskType.CreateToken:
					return this.createToken(user, <CreateTokenAttributes>task.data);

				default:
					throw new Error('Invalid task type.');

			}
		}).then( (results) => {
			resolve(results);
		}).catch( (err: Error) => {
			reject(err);
		});
	}

	/**
	 * Method for adding / removing media items to and from favorites / recents packs
	 * @param {User} user - object representing the user model
	 * @param {EditUserPackItemsAttributes} data - Object containing auxiliary information for processing the request
	 * @returns {Promise<string>} - Promise that resolves to a success message or an error
	 */
	private editUserPackItems (user: User, data: EditUserPackItemsAttributes): Promise<string> {

		if (!data.operation) {
			throw new Error('Operation must be defined in data. Valid operations are: add / remove');
		}

		if (!data.packType) {
			throw new Error('User pack type must be defined in data. Valid types are: favorite / recent');
		}

		if (!data.mediaItem) {
			throw new Error('A valid media item must be defined in data.');
		}

		let packId;
		switch (data.packType) {
			case UserPackType.favorite:
				packId = user.favoritesPackId;
				break;
			case UserPackType.recent:
				packId = user.recentsPackId;
				break;
			default:
				throw new Error('Invalid pack type');
		}

		let pack = new Pack({id: packId});
		return pack.syncData().then(() => {
			var MediaItemClass = MediaItemType.toClass(data.mediaItem.type);
			var mediaItem = new MediaItemClass(data.mediaItem);
			return mediaItem.syncModel();

		}).then((syncedMediaItem) => {

			switch (data.operation) {
				case UserPackOperation.add:
					pack.addItem(syncedMediaItem);

					if (data.packType === UserPackType.recent) {
						let count = user.shareCount + 1;
						user.save({shareCount: count});
					}

					return `Added item ${syncedMediaItem.id} of type ${syncedMediaItem.type} to ${data.packType}`;

				case UserPackOperation.remove:
					pack.removeItem(syncedMediaItem);
					return `Removed item ${syncedMediaItem.id} of type ${syncedMediaItem.type} from ${data.packType}`;

				default:
					throw new Error('Invalid pack type');
			}
		});
	}

	/**
	 * Method for adding / removing packs to users
	 * @param {User} user - object representing the user model
	 * @param {EditUserPackSubscriptionAttributes} data - Object containing auxiliary information for processing the request
	 * @returns {Promise<string>} - Promise that resolves to a success message or an error
	 */
	private editUserPackSubscription (user: User, data: EditUserPackSubscriptionAttributes): Promise<string> {

		if (!data.packId) {
			throw new Error('PackId must be defined in data.');
		}

		if (!data.operation) {
			throw new Error('Operation must be defined in data. Valid operations are: add / remove');
		}

		var packPromise;
		switch (data.operation) {

			case UserPackOperation.add:
				packPromise = user.addPack({id: data.packId}, data.subscriptionInfo);
				break;

			case UserPackOperation.remove:
				packPromise = user.removePack(data.packId);
				break;

			default:
				throw new Error('Invalid operation.');
		}
		return packPromise.then(() => {
			return `Succesfully ${data.operation}ed new pack ${data.packId} to / from user.`;
		});

	}

	/**
	 * Wrapper for initiating user favorites, default and recents packs
	 * @param {User} user - object representing the user model
	 * @returns {Promise<string>} - Promise that resolves to a success message or an error
	 */
	private initiatePacks (user: User): Promise<string> {
		return Promise.all([user.initFavoritesPack(), user.initDefaultPack(), user.initRecentsPack()]).then(() => {
			return 'Successfully initiated favorites, default and recents packs';
		});
	}


	/**
	 * Wrapper for creating and setting a token on a user
	 * @param {User} user - object representing the user model
	 * @param {CreateTokenAttributes} data - Auxiliary user token data
	 * @returns {Promise<string>} - Promise that resolves to a success message or an error
	 */
	private createToken (user: User, data: CreateTokenAttributes): Promise<string> {
		return new Promise((resolve, reject) => {
			var token = UserTokenGenerator.generateToken(user.id, data);
			user.setToken(token);
			resolve(`Successfully created a token for user ${user.id}`);
		});
	}


}

export default UserWorker;
