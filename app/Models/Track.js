import 'backbonefire';
import { Firebase, Model } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import _ from 'underscore';
/**
 * This class is responsible for providing granular functionalities (mostly accessors) for cached responses. 
 */
class Track extends Firebase.Model {

	/**
	 * Initializes the elastic search config model.
	 *
	 * @return {void}
	 */
	initialize () {
		this.urlRoot = `${FirebaseConfig.BaseURL}/tracks`;
		this.autoSync = true;
		this.idAttribute = 'id';
	}

	update ({artist, track, lyrics}) {

		if (_.isUndefined(artist)) {
			throw new Error("Artist information must be defined.");
		}

		if (_.isUndefined(track)) {
			throw new Error("Track information must be defined.");
		}

		var properties = {};

		/* Set track properties */
		for (let prop in track) {
			properties[prop] = track[prop];
		}

		/* Set artist properties */
		for (let prop in artist) {
			properties[`artist_${prop}`] = artist[prop];
		}

		/* Update artist properties */
		properties.lyrics = this.get('lyrics') || {};
		if (properties.lyrics !== {}) {
			// if lyrics arent set then set them and update count
			for (var i = 0; i < lyrics.length; i++) {
				properties.lyrics[`${track.id}_${i}`] = lyrics[i];
			}
		}
		this.set('lyrics', properties.lyrics);
		this.set(properties);
		this.set('id', 'id');
		console.log(this.attributes);
		return this.attributes;

	}
	

}

export default Track;