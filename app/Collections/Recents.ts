import 'backbonefire';
import { Firebase } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import Recent from '../Models/Recent';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import logger from '../Models/Logger';

/**
 * This class is responsible for maintaining the recents collection.
 */
class Recents extends Firebase.Collection<Recent> {
	userId: string;

	/**
	 * Initializes the recents collection.
	 * @param {string} userId - user's id to load up recents
	 *
	 * @return {void}
	 */
	constructor (userId: string) {
		if (typeof userId === 'undefined') {
			throw new Error('userId needs to be set');
		}
		this.userId = userId;

		let opts = {
			idAttribute: 'id',
			model: Recent,
			autoSync: true
		};
		super([], opts);
	}

	/**
	 * Initializes the recents collection.
	 * @param {string} models - optional models for backbone
	 * @param {string} opts - optional options for backbone
	 * @param {string} userId - user's id to load up recents
	 *
	 * @return {void}
	 */
	initialize (models: Recent[], opts: any) {
		this.url = UserTokenGenerator.getAdminReference(`${FirebaseConfig.BaseURL}/users/${this.userId}/recents`);
	}

	/**
	 * Adds an item to the recents collection
	 * @param {object} item - object containing information about an item
	 *
	 * @return {Promise} - Resolves to true when an item is added to the recents collection, 
	 					false if that item is already found in the recents or an error upon rejection
	 */
	addRecent (item: any) {
		logger.info('Recents:addRecent()', 'added recent', item._id);
		return new Promise( (resolve, reject) => {
			let rec = this.find(mod => mod.get('_id') === item._id);

			if (rec) {
				rec.set('time_added', Date.now());
				resolve(false);
			} else {
				item.time_added = Date.now();
				this.create(item);
				resolve(true);
			}
		});
	}

}

export default Recents;
