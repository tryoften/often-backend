import { GeniusData } from '../Services/Genius/GeniusDataTypes';
import { firebase as FirebaseConfig } from '../config';
import * as _ from 'underscore';
import MediaItem from './MediaItem';
import {GeniusServiceResult} from "../Services/Genius/GeniusDataTypes";

/**
 * This class is responsible for providing granular functionality (mostly accessors) for cached responses.
 */
class Artist extends MediaItem {
	constructor(attributes?: any, options?: any) {
		this.urlRoot = `${FirebaseConfig.BaseURL}/artists`;
		this.autoSync = true;

		super(attributes, options);
	}

	public trackExists (songId: string) {
		return _.has(this.get('tracks'), songId);
	}

	/**
	 * Updates current artist model with genius data
	 *
	 * @param data
	 * @param {Artist} data.artist an artist
	 * @returns {any}
     */
	public setGeniusData (data: GeniusServiceResult): Artist {
		var artistData = data.artist.toJSON();
		var trackData = data.track.toJSON();
		var lyricsData = data.lyrics;

		var properties: any = {};

		/* Set artist properties */
		for (let prop in artistData) {
			if (prop === 'id') {
				continue;
			}
			properties[prop] = artistData[prop];
		}

		/* Update artist properties */
		if (!this.trackExists(trackData.id)) {
			/* if track doesn't exist then don't update counts */
			properties.tracks_count = (this.get('tracks_count') || 0) + 1;

			if (lyricsData) {
				properties.lyrics_count = (this.get('lyrics_count') || 0) + lyricsData.length;
			}
		}

		properties.tracks = this.get('tracks') || {};
		properties.tracks[trackData.id] = trackData;

		this.set('time_modified', Date.now());
		this.set(properties);
		this.registerToIdSpace(artistData.id);
		this.save();

		return this;
	}
}

export default Artist;
