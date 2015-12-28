import 'backbonefire';
import { Firebase, Model } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import _ from 'underscore';
/**
 * This class is responsible for providing granular functionalities (mostly accessors) for cached responses. 
 */
class Lyric extends Firebase.Model {

	/**
	 * Initializes the elastic search config model.
	 *
	 * @return {void}
	 */
	initialize () {
		this.urlRoot = `${FirebaseConfig.BaseURL}/lyrics`;
		this.autoSync = true;
		this.idAttribute = 'id';
	}

	update ({artist, track, lyric}) {
		var properties = {};
		
		for (let prop in track) {
			properties[`track_${prop}`] = track[prop];
		}

		for (let prop in artist) {
			properties[`artist_${prop}`] = artist[prop];
		}
		properties.text = lyric;

		this.set(properties);

		return this.attributes;
	}

}

export default Lyric;