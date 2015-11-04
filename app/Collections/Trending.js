import 'backbonefire';
import { Firebase, Model } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import { generateURIfromGuid } from '../Utilities/generateURI';
import _ from 'underscore';

// Note TrendingItem isn't used as the model for the collection, just used to
// fetch individual items when needed
import TrendingItem from '../Models/TrendingItem';

/**
 * This class is responsible for maintaining the favorite collection.
 */
class Trending extends Firebase.Collection {

	/**
	 * Sets model to use for this BackboneFire collection.
	 *
	 * @return {void}
	 */
	constructor () {
		let opts = {
			model: Model.extend({}),
			autoSync: true
		};
		super([], opts);
	}

	/**
	 * Initializes the trending collection.
	 *
	 * @param {string} models - optional models for backbone
	 * @param {string} opts - optional options for backbone
	 *
	 * @return {void}
	 */
	initialize (models, opts) {
		this.url = `${FirebaseConfig.BaseURL}/trending/all`;
		this.idAttribute = 'id';
	}

	/**
	 * Increments counter that tracks how many times an item has been favorited
	 *
	 * @param {object} item - object containing information about an item
	 *
	 * @return {Promise} - Resolves to true as long as operation was successful
	 */
	increment (item) {
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
				(synced_data) => resolve(true),
				(error) => reject(error)
			);
		});

		return promise;
	}


	/**
	 * Decrements counter that tracks how many times an item has been favorited
	 *
	 * @param {object} item - object containing information about an item
	 *
	 * @return {Promise} - Resolves to true as long as operation was successful
	 */
	decrement (item) {
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
				(synced_data) => resolve(true),
				(error) => reject(error)
			);
		});

		return promise;
	}
}

export default Trending;
