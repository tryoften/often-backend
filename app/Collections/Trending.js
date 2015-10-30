import 'backbonefire';
import { Firebase, Model } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import { generateURIfromGuid } from '../Utilities/generateURI';

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
		this.url = `${FirebaseConfig.BaseURL}/trending`;
	}

	/**
	 * Increments counter that tracks how many times an item has been favorited
	 *
	 * @param {object} item - object containing information about an item
	 *
	 * @return {Promise} - Resolves to true as long as operation was successful
	 */
	increment (item) {
		console.log('item.id');
		console.log(item.id);

		let ti = new TrendingItem({id: item.id});

		console.log('URI');
		console.log(generateURIfromGuid(item.id));
		ti.id = generateURIfromGuid(item.id);

		let bindSyncHandler = function(resolve, reject) {
			return (synced) => {
				for (let new_favorite of synced.models)
					console.log(new_favorite);

				resolve();
			};
		};

		let promise = new Promise((resolve, reject) => {
			this.once('sync', bindSyncHandler(resolve, reject), (error) => {
				console.log(error);
			});
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
	decrement () {
	}
}

export default Trending;
