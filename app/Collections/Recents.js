import 'backbonefire';
import { Firebase } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import Recent from '../Models/Recent';

/**
 * This class is responsible for maintaining the recents collection.
 */
class Recents extends Firebase.Collection {

	/**
	 * Initializes the recents collection.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 * @param {string} userId - user's id to load up recents
	 *
	 * @return {void}
	 */
	initialize (models, opts, userId) {
		this.model = Recent;
		this.url = `${FirebaseConfig.BaseURL}/users/${userId}/recents`;
		this.last_recents = 10;
		this.autoSync = true;
	}

	/**
	 * Adds an item to the recents collection
	 * @param {object} inputObj - object containing information about a record
	 *
	 * @return {Promise} - Resolves to true when an item is added to the recents collection, 
	 					false if that item is already found in the recents or an error upon rejection
	 */
	addRecent (inputObj) {
		return new Promise((resolve, reject) => {
			this.once('sync', (syncedRecents) => {
				for (let recModel of syncedRecents.models){
					if (recModel.get('result')._id == inputObj.result._id) {
						resolve(false);
						return;
					}
				}
				this.add(inputObj);
				resolve(true);
			}, (err) => { reject(err)});
		});
	}

	/**
	 * Gets latest recents belonging to a user limited by the limit parameter
	 * optional @param {int} limit - optional parameter identifying the number of records to be returned
	 *
	 * @return {Promise} - Resolves to an ordered array (in descending order of time_accessed property) containing results
	 						or an error.
	 */
	getRecents (limit = this.last_recents) {
		return new Promise((resolve, reject) => {
			this.once('sync', (syncedRecents) => {
				var sortedAndLimited = syncedRecents.sort( (a,b) => {
					return a.time_accessed - b.time_accessed;
				}).slice(0,limit);
				var filtered = [];
				for(let item of sortedAndLimited){
					console.log(item.get('time_accessed'));
					filtered.push(item.get('result'));
				}
				resolve(filtered);
			}, (err) => { reject(err) });
		});


	}

}

export default Recents;