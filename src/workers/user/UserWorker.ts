import { firebase as FirebaseConfig } from '../../config';
import * as _ from 'underscore';
import UserTokenGenerator from '../../Auth/UserTokenGenerator';
import Worker, { Task } from '../Worker';
import GraphModel, {UserNodeAttributes, PackNodeAttributes} from '../../Utilities/GraphModel';
import { SubscriptionAttributes, MediaItemType, MediaItemAttributes, Pack, User, IndexableObject, UserAttributes } from '@often/often-core';

class UserWorkerTaskType extends String {
	static EditUserPackItems: UserWorkerTaskType = 'editUserPackItems';
	static EditUserPackSubscription: UserWorkerTaskType = 'editPackSubscription';
	static InitiatePacks: UserWorkerTaskType = 'initiatePacks';
	static CreateToken: UserWorkerTaskType = 'createToken';
	static SharePackItem: UserWorkerTaskType = 'sharePackItem';
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

interface SharePackItemAttributes {
	packId: string;
	itemId: string;
	itemType: MediaItemType;
}

interface UserWorkerTask extends Task {
	userId: string;
	type: UserWorkerTaskType;
	data?: (EditUserPackItemsAttributes | EditUserPackSubscriptionAttributes | CreateTokenAttributes | SharePackItemAttributes);
}

/* Adding / Removing Items from favorites and recents  */
class UserWorker extends Worker {

	graph: GraphModel;

	constructor (opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.queues.user);
		super(options);
		this.graph = new GraphModel();
	}

	public process (task: UserWorkerTask, progress: Function, resolve: Function, reject: Function) {
		console.log('UserWorker.process(): ', task._id);
		if (!task.userId) {
			reject("User Id not defined");
			return;
		}
		new User({id: task.userId})
			.syncData()
			.then( (model) => {
				let user = model as User;

				switch (task.type) {
					case UserWorkerTaskType.EditUserPackItems:
						return this.editUserPackItems(user, <EditUserPackItemsAttributes>task.data);

					case UserWorkerTaskType.EditUserPackSubscription:
						return this.editUserPackSubscription(user, <EditUserPackSubscriptionAttributes>task.data);

					case UserWorkerTaskType.InitiatePacks:
						return this.initiatePacks(user);

					case UserWorkerTaskType.CreateToken:
						return this.createToken(user, <CreateTokenAttributes>task.data);

					case UserWorkerTaskType.SharePackItem:
						return this.sharePackItem(user, <SharePackItemAttributes>task.data);

					default:
						throw new Error('Invalid task type.');

				}
			}).then( (results) => {
				console.log("Resolving results for ", task._id);
				resolve(results);
			}).catch( (err: Error) => {
				console.log('Err, ',err.stack, task._id );
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
		var MediaItemClass = MediaItemType.toClass(data.mediaItem.type);
		var mediaItem = new MediaItemClass(data.mediaItem);

		return Promise.all([ pack.syncData(), mediaItem.syncModel() ]).then( ([syncedPack, syncedMediaItem]) => {

			switch (data.operation) {
				case UserPackOperation.add:
					syncedPack.addItem(syncedMediaItem.toJSON());
					if (data.packType === UserPackType.recent) {
						let count = user.shareCount + 1;
						user.save({shareCount: count});
					}
					console.log(`Added item ${syncedMediaItem.id} of type ${syncedMediaItem.type} to ${data.packType}`);
					return pack.addItem(syncedMediaItem);

				case UserPackOperation.remove:
					syncedPack.removeItem(syncedMediaItem.toJSON());
					return `Removed item ${syncedMediaItem.id} of type ${syncedMediaItem.type} from ${data.packType}`;

				default:
					throw new Error('Invalid pack type');
			}
		}).then((updatedPack: Pack) => {
			return this.graph.updateNode(updatedPack.getTargetGraphProperties());
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
		return packPromise.then((pack) => {

			//Update user & pack models in graph to ensure that all data is set.
			let packUpdate = this.graph.updateNode(pack.getTargetGraphProperties());
			let userUpdate = this.graph.updateNode(user.getTargetGraphProperties());

			let relUpdate;
			if (data.operation === UserPackOperation.add) {
				relUpdate = this.updatePackRelationships(user, pack);
			} else {
				relUpdate = this.removePackRelationships(user, pack);
			}

			return Promise.all([packUpdate, userUpdate]).then(() => {
				return relUpdate;
			});

		});

	}

	private updatePackRelationships(user: User, pack: Pack) {
		let prom1, prom2;
		if (user.id === pack.ownerId) {
			/* If this user owns pack, then (user) -[:OWNS]-> (pack) */
			prom1 = this.graph.updateRelationship({id: user.id, type: user.type}, {id: pack.id, type: pack.type}, {name: "OWNS"});
		} else {
			/* Otherwise, the (user) -[:FOLLOWS]-> (pack's owner) */
			prom1 = this.graph.updateRelationship({id: user.id, type: user.type}, {id: pack.ownerId, type: user.type}, {name: "FOLLOWS"});
		}
		/* User follows pack */
		prom2 = this.graph.updateRelationship({id: user.id, type: user.type}, {id: pack.id, type: pack.type}, {name: "FOLLOWS"});
		return Promise.all([prom1, prom2]);
	}

	private removePackRelationships(user: User, pack: Pack) {
		let prom1 = this.graph.removeRelationship({id: user.id, type: user.type}, {id: pack.id, type: pack.type}, {name: "FOLLOWS"});
		let prom2 = this.graph.removeRelationship({id: user.id, type: user.type}, {id: pack.ownerId, type: user.type}, {name: "FOLLOWS"});
		return Promise.all([prom1, prom2]);
	}

	private sharePackItem (user: User, data: SharePackItemAttributes): Promise<any> {
		user.incrementShareCount();
		user.save();

		let updatedPack = new Pack({ id: data.packId }).syncData().then((syncedPack: Pack) => {
			syncedPack.incrementShareCount();
			syncedPack.save();
		});

		let ItemClass = MediaItemType.toClass(data.itemType);
		let updatedItem = new ItemClass({ id: data.itemId }).syncData().then((syncedItem: any) => {
			syncedItem.incrementShareCount();
			syncedItem.save();
		});

		return Promise.all([updatedPack, updatedItem]);
	}


	/**
	 * Wrapper for initiating user favorites, default and recents packs
	 * @param {User} user - object representing the user model
	 * @returns {Promise<string>} - Promise that resolves to a success message or an error
	 */
	private initiatePacks (user: User): Promise<any> {
		let userProps = user.getTargetObjectProperties();
		let graphUser =  this.graph.updateNode(this.getUserNodeAttributes(userProps));

		let packPromises =  Promise.all([
			user.initDefaultPack(),
			user.initFavoritesPack(),
			user.initRecentsPack()
		]);

		return graphUser.then(() => { return packPromises; }).then( (packArr: Pack[]) => {

			let defPack = packArr[0];
			let favPack = packArr[1];
			let recPack = packArr[2];

			/* Update relationships for default pack */
			let defProm = this.updatePackRelationships(user, defPack);

			/* Create graph object for favorite pack & then establish a relationship relationship */
			let favProm = this.graph.updateNode(this.getPackNodeAttributes(favPack.toIndexingFormat()))
				.then(() => {
					return this.updatePackRelationships(user, favPack);
				});

			/* Create graph object for recent pack & create relationship */
			let recProm =  this.graph.updateNode(this.getPackNodeAttributes(recPack.toIndexingFormat()))
				.then(() => {
					return this.updatePackRelationships(user, recPack);
				});

			return Promise.all([ favProm, recProm]);
		});
	}

	private getUserNodeAttributes(user: UserAttributes): UserNodeAttributes {
		return {
			id: user.id,
			type: user.type
		};
	}

	private getPackNodeAttributes(pack: IndexableObject): PackNodeAttributes {
		return {
			id: pack.id,
			type: pack.type
		};
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
