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
	 * Initializes the favorites collection.
	 * @param {object} models - supporting models
	 * @param {object} opts - supporting options
	 * @param {string} userId - user's id to load up favorites
	 *
	 * @return {void}
	 */
	initialize (models, opts, userId) {
		this.model = Favorite;
		this.url = `${FirebaseConfig.BaseURL}/users/${userId}/favorites`;
		this.autoSync = true;
	}

	/**
	 * Adds an item to the favorites collection
	 * @param {object} inputObj - object containing information about a record
	 *
	 * @return {Promise} - Resolves to true when an item is added to the favorites collection, 
	 					false if that item is already found in the favorites or an error upon rejection
	 */
	favorite (inputObj) {
		return new Promise( (resolve, reject) => {
			this.once('sync', 
				syncedFavorites => {		
					for (let favModel of syncedFavorites.models){
						if (favModel.get('result')._id == inputObj.result._id) {
							resolve(false);
							return;	
						}
					}
					this.add(inputObj);
					resolve(true);
				}, 
				err => { reject(err) });
		});
	}

	/**
	 * Removes an item to the favorites collection
	 * @param {object} inputObj - object containing information about a record
	 *
	 * @return {Promise} - Resolves to true when an item is removed from the favorites collection, 
	 					false if that item is not found in the favorites or an error upon rejection
	 */
	unfavorite (inputObj) {
		return new Promise( (resolve, reject) => {
			this.once('sync', 
				syncedFavorites => {
					for (let favModel of syncedFavorites.models){
						if (favModel.get('result')._id == inputObj.result._id) {
							this.remove(favModel);
							resolve(true);
							return;
						}
					}
					resolve(false);
				}, 
				err => { reject(err) });
		});
	}

	/**
	 * Gets favorites belonging to a user
	 *
	 * @return {Promise} - Resolves to an array containing recentresults or an error.
	 */
	getFavorites () {
		return new Promise( (resolve, reject) => {
			this.once('sync', 
				syncedFavorites => {
					resolve(syncedFavorites);
				}, 
				err => { reject(err) });
		});
	
	}

}

export default Favorites;