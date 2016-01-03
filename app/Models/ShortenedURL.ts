import 'backbonefire';
import { Firebase } from 'backbone';
import config from '../config';

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for cached responses. 
 */
class ShortenedURL extends Firebase.Model {

	/**
	 * Initializes the elastic search config model.
	 *
	 * @return {void}
	 */
	initialize (hash: string) {
		this.url = `${config.firebase.BaseURL}/urls/${hash}`;
		this.autoSync = true;
	}

}

export default ShortenedURL;
