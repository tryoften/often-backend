import 'backbonefire';
import { Firebase } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import Favorite from '../Models/Favorite';
import fb from 'firebase';

/**
 * This class is responsible for maintaining the favorite collection.
 */
class Favorites extends Firebase.Collection {

	/**
	 * Constructs the favorites collection.
	 * @param {string} userId - user's id to load up favorites
	 *
	 * @return {void}
	 */
	 constructor (userId) {
		if (typeof userId === 'undefined') {
			throw new Error('userId needs to be set');
		}

		let opts = {
			model: Favorite,
			autoSync: true
		};
		super([], opts, userId);
	}

	/**
	 * Initializes the favorites collection.
	 * @param {string} models - optional models for backbone
	 * @param {string} opts - optional options for backbone
	 * @param {string} userId - user's id to load up favorties
	 *
	 * @return {void}
	 */
	initialize (models, opts, userId) {
		this.idAttribute = 'id';
		this.url = `${FirebaseConfig.BaseURL}/users/${userId}/favorites`;
	}

	/**
	 * Adds an item to the favorites collection
	 * @param {object} result - object containing information about a result
	 *
	 * @return {Promise} - Resolves to true when an item is added to the favorites collection, 
	 					false if that item is already found in the favorites or an error upon rejection
	 */
	favorite (result) {
		return new Promise( (resolve, reject) => {
			this.once('sync', 
				syncedFavorites => {		
					for (let favModel of syncedFavorites.models) {						
						if (favModel.get('_id') == result._id) {
							resolve(false);
							return;	
						}
					}
					result.time_added = Date.now();
					this.add(result);
					resolve(true);
				}, 
				err => {
					reject(err);
				});
		});
	}

	/**
	 * Removes an item to the favorites collection
	 * @param {object} result - object containing information about a result
	 *
	 * @return {Promise} - Resolves to true when an item is removed from the favorites collection, 
	 					false if that item is not found in the favorites or an error upon rejection
	 */
	unfavorite (result) {
		return new Promise( (resolve, reject) => {
			this.once('sync', 
				syncedFavorites => {
					for (let favModel of syncedFavorites.models) {
						if (favModel.get('_id') == result._id) {
							syncedFavorites.remove(favModel);
							resolve(true);
							return;
						}
					}
					resolve(false);
				}, 
				err => {
					reject(err);
				});
		});
	}

}

export default Favorites;