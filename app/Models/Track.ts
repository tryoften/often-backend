import { firebase as FirebaseConfig } from '../config';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import * as _ from 'underscore';
import BaseModel from "./BaseModel";
import Lyric from "./Lyric";
import Artist from "./Artist";
import MediaItem from "./MediaItem";
import { GeniusData, GeniusArtistData, GeniusTrackData } from "../Services/Genius/GeniusDataTypes";

/**
 * Track model throughout the platform
 */
class Track extends MediaItem {

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

	setGeniusData (data: GeniusData) {
		var {artist, track, lyrics} = data;

		this.registerToIdSpace(track.id);

		var properties: any = {};

		/* Set track properties */
		for (let prop in track) {
			if (prop === "id") {
				continue;
			}
			properties[prop] = track[prop];
		}

		/* Set artist properties */
		for (let prop in artist) {
			properties[`artist_${prop}`] = artist[prop];
		}

		/* Update artist properties */
		if (lyrics) {
			properties.lyrics = this.get('lyrics') || {};

			for (var i = 0; i < lyrics.length; i++) {
				properties.lyrics[`${track.id}_${i}`] = lyrics[i];
			}

			properties.lyrics_count = (this.get('lyrics_count') || 0) + lyrics.length;
		}
		
		this.set(properties);
		this.set('time_modified', Date.now());
		return this.attributes;

	}
	

}

export default Track;
