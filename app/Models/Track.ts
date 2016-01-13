import { GeniusLyricData } from '../Services/Genius/GeniusDataTypes';
import { firebase as FirebaseConfig } from '../config';
import MediaItem from './MediaItem';
import Artist from './Artist';
import Lyric from './Lyric';
import * as _ from 'underscore';

/**
 * Track model throughout the platform
 */
class Track extends MediaItem {
	get lyrics(): GeniusLyricData[] {
		return this.get('lyrics') || [];
	}

	set lyrics(value: GeniusLyricData[]) {
		this.set('lyrics', value);
	}

	/**
	 * Initializes the elastic search config model.
	 *
	 * @return {void}
	 */
	public initialize () {
		this.urlRoot = `${FirebaseConfig.BaseURL}/tracks`;
		this.autoSync = true;
		this.idAttribute = 'id';
	}

	public setGeniusData (artist: Artist, lyrics: Lyric[]) {
		// save any properties that have been set up until this point.
		this.save();

		var artistData = artist.toJSON();
		var lyricsData = _.map(lyrics, lyric => lyric.toJSON());
		var properties: any = {};

		/* Set artist properties */
		for (let prop in artistData) {
			if (artistData.hasOwnProperty(prop)) {
				properties[`artist_${prop}`] = artistData[prop];
			}
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
		this.save();

		return this;
	}
}

export default Track;
