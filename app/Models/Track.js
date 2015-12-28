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
		if (!_.isUndefined(lyrics)) {
			properties.lyrics = this.get('lyrics') || {};

			for (var i = 0; i < lyrics.length; i++) {
				properties.lyrics[`${track.id}_${i}`] = lyrics[i];
			}

			properties.lyrics_count = (this.get('lyrics_count') || 0) + lyrics.length;
			//this.set('lyrics', properties.lyrics);
		}
	
		
		this.set(properties);
		this.set('time_modified', Date.now());
		return this.attributes;

	}
	

}

export default Track;