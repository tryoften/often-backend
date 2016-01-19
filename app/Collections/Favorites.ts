import 'backbonefire';
import { Firebase } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import { generateURIfromGuid } from '../Utilities/generateURI';
import Favorite from '../Models/Favorite';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import logger from '../Models/Logger';

/**
 * This class is responsible for maintaining the favorite collection.
 */
class Favorites extends Firebase.Collection<Favorite> {
	userId: string;

	/**
	 * Constructs the favorites collection.
	 * @param {string} userId - user's id to load up favorites
	 *
	 * @return {void}
	 */
	constructor (userId: string) {
		if (typeof userId === 'undefined') {
			throw new Error('userId needs to be set');
		}
		this.userId = userId;

		let opts = {
			model: Favorite,
			autoSync: true
		};
		super([], opts);
	}

	/**
	 * Initializes the favorites collection.
	 * @param {string} models - optional models for backbone
	 * @param {string} opts - optional options for backbone
	 *
	 * @return {void}
	 */
	initialize (models: Favorite[], opts: any) {
		this.url = UserTokenGenerator.getAdminReference(`${FirebaseConfig.BaseURL}/users/${this.userId}/favorites`);
	}

	/**
	 * Adds an item to the favorites collection
	 * @param {object} item - object containing information about an item
	 *
	 * @return {Promise} - Resolves to true when an item is added to the favorites collection,
	 false if that item is already found in the favorites or an error upon rejection
	 */
	favorite (item: any) {
		logger.info('Favorites:favorite()', 'favorited item', item._id);
		return new Promise( (resolve, reject) => {
			for (let model of this.models) {
				if (model.get('id') === item.id) {
					resolve(false);
					return;
				}
			}
			item.time_added = Date.now();
			this.add(item);
			resolve(true);
		});
	}

	/**
	 * Removes an item to the favorites collection
	 * @param {object} item - object containing information about an item
	 *
	 * @return {Promise} - Resolves to true when an item is removed from the favorites collection,
	 false if that item is not found in the favorites or an error upon rejection
	 */
	unfavorite (item: any) {
		logger.info('Favorites:unfavorite()', 'unfavorited item', item._id);
		return new Promise( (resolve, reject) => {
			for (let model of this.models) {
				if (model.get('_id') === item._id) {
					this.remove(model);
					resolve(true);
					return;
				}
			}
			resolve(false);
		});
	}

}

export default Favorites;
