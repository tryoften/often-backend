import { firebase as FirebaseConfig } from '../config';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import * as _ from 'underscore';
import MediaItem from "./MediaItem";
import { GeniusData, GeniusLyricData } from "../Services/Genius/GeniusDataTypes";

/**
 * Track model throughout the platform
 */
class Track extends MediaItem {
	get lyrics(): GeniusLyricData[] {
		return this.get("lyrics") || [];
	}

	set lyrics(value: GeniusLyricData[]) {
		this.set("lyrics", value);
	}

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
		var artistData = data.artist;
		var trackData = data.track;
		var lyricsData = data.lyrics;
		var properties: any = {};

		this.registerToIdSpace(trackData.id);

		/* Set track properties */
		for (let prop in trackData) {
			if (prop === "id") {
				continue;
			}
			properties[prop] = trackData[prop];
		}

		/* Set artist properties */
		for (let prop in artistData) {
			properties[`artist_${prop}`] = artistData[prop];
		}

		/* Update artist properties */
		if (lyricsData) {
			properties.lyrics = this.get('lyrics') || {};

			for (var lyric of lyricsData) {
				properties.lyrics[lyric.id] = lyric;
			}

			properties.lyrics_count = (this.get('lyrics_count') || 0) + lyricsData.length;
		}
		
		this.set(properties);
		this.set('time_modified', Date.now());
		return this;
	}
}

export default Track;
