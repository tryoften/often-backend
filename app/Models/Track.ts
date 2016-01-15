import { GeniusLyricData } from '../Services/Genius/GeniusDataTypes';
import { IndexedObject } from '../Interfaces/Indexable';
import { firebase as FirebaseConfig } from '../config';
import MediaItem from './MediaItem';
import Artist from './Artist';
import Lyric from './Lyric';
import * as _ from 'underscore';

/**
 * Track model throughout the platform
 */
class Track extends MediaItem {

	// TODO(jakub): create an interface for track that guarantees 'common' indexed fields
	get title(): string {
		return this.get('title');
	}

	get artist_name(): string {
		return this.get('artist_name');
	}

	get album_name(): string {
		return this.get('album_name');
	}

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

	public toIndexingFormat(): IndexedObject {
		let data = super.toIndexingFormat();
		data.title = this.title || '';
		data.author = this.artist_name || '';
		data.description = '';

		return data;
	}
}

export default Track;
