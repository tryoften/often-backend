import Worker from './Worker';
import Recents from '../Collections/Recents';
import Favorites from '../Collections/Favorites';
import Trending from '../Collections/Trending';
import { firebase as FirebaseConfig } from '../config';
import _ from 'underscore';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import Users from '../Collections/Users';

class UserWorker extends Worker {

	constructor (opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.queues.user);
		super(options);
		this.users = new Users();
	}

	/**
	 * Processes the user related tasks
	 * @param {object} data - data object from the user queue
	 *  Required attributes:
	 *	user - id of user on whose behalf a given task is to be processed
	 *  task - specifies the operation to be performed. Currently supported tasks are: addFavorite, removeFavorite, addRecent
	 *  result - contains a search result on which the task should be performed
	 *  Example:
	 *
	 *  data : {
	 *		user : "myUser123",
	 *		task : "addFavorites",
	 *		result : {
	 *			_id : someGuid,
	 *			//more stuff here
	 *		}
	 *	}
	 * @param {function} progress - callback function for reporting the state of an item
	 * @param {function} resolve - callback marking the task as complete
	 * @param {function} reject - callback marking the task as incomplete
	 *
	 * @return {void}
	 */
	process (data, progress, resolve, reject) {
		try {
			if (data.task == 'addFavorite') {
				// Instantiate favorites collection for user
				let favs = new Favorites(data.user);
				let favorites_promise = favs.favorite(data.result);

				// Also increment counter in trending
				let trending_collection = new Trending();
				let trending_promise = trending_collection.increment(data.result);

				let promises = Promise.all([favorites_promise, trending_promise]);

				// Resolves if both promises resolve, otherwise rejects
				promises.then( (values) => {
					resolve(values[0]);
				}).catch( (err) => {
					reject(err);
				});

			} else if (data.task == 'removeFavorite') {
				//instantiate favorites collection for user
				let favs = new Favorites(data.user);
				let favorites_promise = favs.unfavorite(data.result);

				// Also increment counter in trending
				let trending_collection = new Trending();
				let trending_promise = trending_collection.decrement(data.result);

				let promises = Promise.all([favorites_promise, trending_promise]);

				// Resolves if both promises resolve, otherwise rejects
				promises.then( (values) => {
					resolve(values[0]);
				}).catch( (err) => {
					reject(err);
				});

			} else if (data.task == 'addRecent') {
				//instantiate recents collection for user
				let recs = new Recents(data.user);
				recs.addRecent(data.result)
					.then( (d) => {
						resolve(d);
					}).catch( (err) => {
						reject(err);
					});

			} else if (data.task == 'createToken') {
				console.log("Processing");
				var token = UserTokenGenerator.generateToken(data.user, data.data);
				var user = this.users.get(data.user);
				if (_.isUndefined(user)) {
					this.users.create({ 
						id : data.user,
						auth_token : token 
					});
				} else {
					user.setToken(token);
				}
				resolve(token);
				
			} else {
				//no task found return an error
				reject('Invalid user task detected');
			}
		} catch(err) {
			reject(err);
		}
	}
}

export default UserWorker;
