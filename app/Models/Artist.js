import 'backbonefire';
import { Firebase, Model } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import _ from 'underscore';
/**
 * This class is responsible for providing granular functionalities (mostly accessors) for cached responses. 
 */
class Artist extends Firebase.Model {

	/**
	 * Initializes the elastic search config model.
	 *
	 * @return {void}
	 */
	initialize () {
		this.urlRoot = `${FirebaseConfig.BaseURL}/artists`;
		this.autoSync = true;
		this.idAttribute = 'id';
	}

	trackExists (songId) {
		var tracksObj = this.get("tracks");
		if (!_.isUndefined(tracksObj) && !_.isNull(tracksObj)) {
			return !_.isUndefined(tracksObj[songId]) && !_.isNull(tracksObj[songId]);
		}
		return false;
	}

	update ({artist, track, lyrics}) {
		console.log('updating artist');
		if (_.isUndefined(artist)) {
			throw new Error("Artist information must be defined.");
		}

		if (_.isUndefined(track)) {
			throw new Error("Track information must be defined.");
		}

		var properties = {};

		/* Set artist properties */
		for (let prop in artist) {
			properties[prop] = artist[prop];
		}

		/* Update artist properties */
		if (!this.trackExists(track.id)) {
			/* if track doesn't exist then don't update counts */
			
			properties.tracks_count = (this.get('tracks_count') || 0) + 1
			
			if (!_.isUndefined(lyrics)) {
				properties.lyrics_count = (this.get('lyrics_count') || 0) + lyrics.length;
			}
			
		} else {
			properties.tracks_count = this.get('tracks_count');
			properties.lyrics_count = this.get('lyrics_count');
		}
		properties.tracks = this.get('tracks') || {};
		properties.tracks[track.id] = track;
		this.set(properties);
		this.set('tracks', properties.tracks);
		this.set('id', 'id');

		return this.attributes;

	}
}

export default Artist;