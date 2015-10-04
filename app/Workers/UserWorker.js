import Worker from './Worker';
import Recents from '../Collections/Recents';
import Favorites from '../Collections/Favorites';
import { firebase as FirebaseConfig } from '../config';
import _ from 'underscore';

class UserWorker extends Worker {
	
	constructor (opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.queues.user);
		super(options);
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
				//instantiate favorites collection for user
				let favs = new Favorites(data.user);
				favs.favorite(data.result)
				.then( (d) => {
					resolve(d);
				}).catch( (err) => {
					reject(err);
				});

			} else if (data.task == 'removeFavorite') {
				//instantiate favorites collection for user
				let favs = new Favorites(data.user);
				favs.unfavorite(data.result)
				.then( (d) => {
					resolve(d);
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