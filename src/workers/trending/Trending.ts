import 'backbonefire';
import { Firebase } from 'backbone';
import config from '../config';
import { generateURIfromGuid } from '../Utilities/generateURI';
import * as _ from 'underscore';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import TrendingItem from './TrendingItem';

/**
 * This class is responsible for maintaining the favorite collection.
 */
class Trending extends Firebase.Model {

	/**
	 * Initializes the trending collection.
	 *
	 * @param {string} models - optional models for backbone
	 * @param {string} opts - optional options for backbone
	 *
	 * @return {void}
	 */
	initialize (attributes: any, options?: any) {
		super.initialize(attributes, options);
		this.url = UserTokenGenerator.getAdminReference(`${config.firebase.BaseURL}/trending/`);
	}

	/**
	 * Increments counter that tracks how many times an item has been favorited
	 *
	 * @param {object} item - object containing information about an item
	 * @return {Promise} - Resolves to true as long as operation was successful
	 */
	increment (item: any) {
		// So that URI isn't generated twice by accident between Trending and Favorites
		item = _.clone(item);

		// Sync up with firebase and update counter
		item.id = generateURIfromGuid(item.id);
		let ti = new TrendingItem({id: item.id});
		ti.set(item);

		if (ti.get('favorited_count')) {
			ti.set('favorited_count', ti.get('favorited_count') + 1);
		} else {
			ti.set('favorited_count', 1);
		}

		// Just in case we want to do anything with the full collection
		let promise = new Promise((resolve, reject) => {
			this.once('sync',
				(synced_data: any) => resolve(true),
				(error: Error) => reject(error)
			);
		});

		return promise;
	}


	/**
	 * Decrements counter that tracks how many times an item has been favorited
	 *
	 * @param {object} item - object containing information about an item
	 * @return {Promise} - Resolves to true as long as operation was successful
	 */
	decrement (item: any) {
		// So that URI isn't generated twice by accident between Trending and Favorites
		item = _.clone(item);

		// Sync up with firebase and update counter
		item.id = generateURIfromGuid(item.id);
		let ti = new TrendingItem({id: item.id});
		ti.set(item);

		if (ti.get('favorited_count')) {
			ti.set('favorited_count', ti.get('favorited_count') - 1);
		} else {
			ti.set('favorited_count', 0);
		}

		// Just in case we want to do anything with the full collection
		let promise = new Promise((resolve, reject) => {
			this.once('sync',
				(synced_data: any) => resolve(true),
				(error: Error) => reject(error)
			);
		});

		return promise;
	}
}

export default Trending;
