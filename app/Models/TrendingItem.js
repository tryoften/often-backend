import 'backbonefire';
import { Firebase } from 'backbone';
import config from '../config';

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for favorites.
 */
class TrendingItem extends Firebase.Model {

	initialize () {
		this.urlRoot = config.firebase.BaseURL + '/trending';
		this.autoSync = true;
	}

}

export default TrendingItem;
