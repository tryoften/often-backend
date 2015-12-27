import 'backbonefire';
import { Firebase } from 'backbone';
import { firebase as FirebaseConfig } from '../config';

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for cached responses. 
 */
class ShortenedURL extends Firebase.Model {

	/**
	 * Initializes the elastic search config model.
	 *
	 * @return {void}
	 */
	initialize (hash) {
		this.url = `${FirebaseConfig.BaseURL}/urls/${hash}`;
		this.autoSync = true;
	}

}

export default ShortenedURL;