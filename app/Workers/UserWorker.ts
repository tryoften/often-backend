import Recents from '../Collections/Recents';
import Favorites from '../Collections/Favorites';
import { firebase as FirebaseConfig } from '../config';
import * as _ from 'underscore';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import User from '../Models/User';
import Worker, { Task } from './Worker';
import Category from '../Models/Category';
import LyricIndexableObject from '../Models/Lyric';
import { PackSubscriptionAttributes } from '../Models/PackSubscription';

class UserWorkerTaskType extends String {
	static AddFavorite: UserWorkerTaskType = 'addFavorite';
	static RemoveFavorite: UserWorkerTaskType = 'removeFavorite';
	static AddRecent: UserWorkerTaskType = 'addRecent';
	static CreateToken: UserWorkerTaskType = 'createToken';
	static AssignCategory: UserWorkerTaskType = 'assignCategory';
	static AddPack: UserWorkerTaskType = 'addPack';
	static RemovePack: UserWorkerTaskType = 'removePack';
}


interface UserWorkerTask extends Task {
	// id of user on whose behalf a given task is to be processed
	user: string;
	// specifies the operation to be performed
	type: UserWorkerTaskType;
	result?: Object;
	category?: Object;
	data?: (any | PackSubscriptionAttributes);
}




class UserWorker extends Worker {

	constructor (opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.queues.user);
		super(options);
	}

	/**
	 * Processes the user related tasks
	 * @param {object} task - task object from the user queue
	 * @param {function} progress - callback function for reporting the state of an item
	 * @param {function} resolve - callback marking the task as complete
	 * @param {function} reject - callback marking the task as incomplete
	 *
	 * @return {void}
	 *
	 * @example
	 *
	 *  task : {
	 *		user : 'myUser123',
	 *		task : 'addFavorites',
	 *		result : {
	 *			_id : someGuid,
	 *			//more stuff here
	 *		}
	 *	}
	 */
	process (task: UserWorkerTask, progress: Function, resolve: Function, reject: Function) {
		switch (task.type) {
			case UserWorkerTaskType.AddFavorite:
				this.addFavorite(task, resolve, reject);
				break;
			case UserWorkerTaskType.RemoveFavorite:
				this.removeFavorite(task, resolve, reject);
				break;
			case UserWorkerTaskType.AddRecent:
				this.addRecent(task, resolve, reject);
				break;
			case UserWorkerTaskType.CreateToken:
				this.createToken(task, resolve, reject);
				break;
			case UserWorkerTaskType.AssignCategory:
				this.assignCategory(task, resolve, reject);
				break;
			case UserWorkerTaskType.AddPack:
				this.addPack(task, resolve, reject);
				break;
			case UserWorkerTaskType.RemovePack:
				this.removePack(task, resolve, reject);
				break;
		}
	}

	addPack(task: UserWorkerTask, resolve: Function, reject: Function) {
		let user = new User(task.user);
		user.addPack(task.data.packId).then(() => {
			resolve(true);
		}).catch(() => {
			reject(false);
		});
	}

	removePack(task: UserWorkerTask, resolve: Function, reject: Function) {
		let user = new User(task.user);
		user.removePack(task.data.packId);
	}

	addFavorite(data: UserWorkerTask, resolve: Function, reject: Function) {
		// Instantiate favorites collection for user
		let favs = new Favorites(data.user);

		// Resolves if both promises resolve, otherwise rejects
		favs.favorite(data.result).then( (values) => {
			resolve(values[0]);
		}).catch( (err) => {
			reject(err);
		});
	}

	removeFavorite(data: UserWorkerTask, resolve: Function, reject: Function) {
		// instantiate favorites collection for user
		let favs = new Favorites(data.user);

		// Resolves if both promises resolve, otherwise rejects
		favs.unfavorite(data.result).then( (values) => {
			resolve(values[0]);
		}).catch( (err) => {
			reject(err);
		});
	}

	addRecent(data: UserWorkerTask, resolve: Function, reject: Function) {
		// instantiate recents collection for user
		let recs = new Recents(data.user);
		recs.addRecent(data.result)
			.then( (d) => {
				resolve(d);
			}).catch( (err) => {
			reject(err);
		});
	}

	createToken(data: UserWorkerTask, resolve: Function, reject: Function) {
		var token = UserTokenGenerator.generateToken(data.user, data.data);
		var user = new User(data);
		user.setToken(token);
		resolve(token);
	}

	assignCategory(data: UserWorkerTask, resolve: Function, reject: Function) {
		let category = new Category(data.category);
		let lyric: LyricIndexableObject = <LyricIndexableObject>data.result;
		category.addLyric(lyric).then(() => {
			resolve(true);
		}).catch(error => {
			reject(JSON.stringify(error));
		});
	}

}

export default UserWorker;
