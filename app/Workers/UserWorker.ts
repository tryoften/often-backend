import Recents from '../Collections/Recents';
import Favorites from '../Collections/Favorites';
import { firebase as FirebaseConfig } from '../config';
import * as _ from 'underscore';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import User from '../Models/User';
import { Task, Worker } from './Worker';
import Category from '../Models/Category';
import LyricIndexableObject from '../Models/Lyric';

class UserWorkerTaskType extends String {
	static AddFavorite: UserWorkerTaskType = 'addFavorite';
	static RemoveFavorite: UserWorkerTaskType = 'removeFavorite';
	static AddRecent: UserWorkerTaskType = 'addRecent';
	static CreateToken: UserWorkerTaskType = 'createToken';
	static AssignCategory: UserWorkerTaskType = 'assignCategory';
}

interface UserWorkerTask extends Task {
	// id of user on whose behalf a given task is to be processed
	user: string;
	// specifies the operation to be performed
	task: UserWorkerTaskType;
	result?: Object;
	category?: Object;
	data?: any;
}

class UserWorker extends Worker {

	constructor (opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.queues.user);
		super(options);
	}

	/**
	 * Processes the user related tasks
	 * @param {object} data - data object from the user queue
	 * @param {function} progress - callback function for reporting the state of an item
	 * @param {function} resolve - callback marking the task as complete
	 * @param {function} reject - callback marking the task as incomplete
	 *
	 * @return {void}
	 *
	 * @example
	 *
	 *  data : {
	 *		user : 'myUser123',
	 *		task : 'addFavorites',
	 *		result : {
	 *			_id : someGuid,
	 *			//more stuff here
	 *		}
	 *	}
	 */
	process (data: UserWorkerTask, progress: Function, resolve: Function, reject: Function) {
		switch (data.task) {
			case UserWorkerTaskType.AddFavorite:
				this.addFavorite(data, resolve, reject);
				break;
			case UserWorkerTaskType.RemoveFavorite:
				this.removeFavorite(data, resolve, reject);
				break;
			case UserWorkerTaskType.AddRecent:
				this.addRecent(data, resolve, reject);
				break;
			case UserWorkerTaskType.CreateToken:
				this.createToken(data, resolve, reject);
				break;
			case UserWorkerTaskType.AssignCategory:
				this.assignCategory(data, resolve, reject);
				break;
		}
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
