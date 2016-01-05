import { firebase as FirebaseConfig } from '../config';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import * as _ from 'underscore';
import BaseModel from "./BaseModel";
import Track from "./Track";
import MediaItem from "./MediaItem";
import { GeniusData, GeniusArtistData, GeniusTrackData } from "../Services/Genius/GeniusDataTypes";

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for cached responses. 
 */
class Artist extends MediaItem {

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

	trackExists (songId: string) {
		return _.has(this.get("tracks"), songId);
	}

	/**
	 * Updates current artist model with genius data
	 *
	 * @param data
	 * @param {Artist} data.artist an artist
	 * @returns {any}
     */
	setGeniusData (data: GeniusData): Artist {
		var {artist, track, lyricsCount} = data;

		this.registerToIdSpace(artist.id);

		var properties: any = {};

		/* Set artist properties */
		for (let prop in artist) {
			if (prop === "id") {
				continue;
			}
			properties[prop] = artist[prop];
		}

		/* Update artist properties */
		if (!this.trackExists(track.id)) {
			/* if track doesn't exist then don't update counts */
			properties.tracks_count = (this.get('tracks_count') || 0) + 1;
			
			if (lyricsCount) {
				properties.lyrics_count = (this.get('lyrics_count') || 0) + lyricsCount;
			}
		} 

		properties.tracks = this.get('tracks') || {};
		properties.tracks[track.id] = track;
		//properties = JSON.parse(JSON.stringify(properties));
		console.dir(properties);
		this.set('time_modified', Date.now());
		this.set(properties);

		return this;
	}
}

export default Artist;
