import 'backbonefire';
import { Firebase } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import Recent from '../Models/Recent';
import _ from 'underscore';

/**
 * This class is responsible for maintaining the recents collection.
 */
class Recents extends Firebase.Collection {

	/**
	 * Initializes the recents collection.
	 * @param {string} userId - user's id to load up recents
	 *
	 * @return {void}
	 */
	constructor (userId) {
		if (typeof userId === 'undefined') {
			throw new Error('userId needs to be set');
		}

		let opts = {
			model: Recent,
			autoSync: true
		};
		super([], opts, userId);
	}

	/**
	 * Initializes the recents collection.
	 * @param {string} models - optional models for backbone
	 * @param {string} opts - optional options for backbone
	 * @param {string} userId - user's id to load up recents
	 *
	 * @return {void}
	 */
	initialize (models, opts, userId) {
		this.idAttribute = 'id';
		this.url = `${FirebaseConfig.BaseURL}/users/${userId}/recents`;
	}

	/**
	 * Adds an item to the recents collection
	 * @param {object} result - object containing information about a result
	 *
	 * @return {Promise} - Resolves to true when an item is added to the recents collection, 
	 					false if that item is already found in the recents or an error upon rejection
	 */
	addRecent (result) {
		return new Promise( (resolve, reject) => {
			this.once('sync', 
				syncedRecents => {
					let rec = syncedRecents.find((mod) => { return mod.get('_id') == result._id });
					if (rec) {
						rec.set('time_added', Date.now());
						resolve(false);
					} else {
						result.time_added = Date.now();
						syncedRecents.create(result);
						resolve(true);
					}
				}, 
				err => { reject(err) });
		});
	}

}

export default Recents;