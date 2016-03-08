import { firebase as FirebaseConfig } from '../config';
import * as _ from 'underscore';
import MediaItem from './MediaItem';
import { GeniusServiceResult } from '../Services/Genius/GeniusDataTypes';
import { IndexableObject } from '../Interfaces/Indexable';
import * as Firebase from 'firebase';

/**
 * This class is responsible for providing granular functionality (mostly accessors) for cached responses.
 */
class Artist extends MediaItem {

	// TODO(jakub): create an interface for artist that guarantees 'common' indexed fields
	constructor(attributes?: any, options?: any) {
		this.urlRoot = `${FirebaseConfig.BaseURL}/artists`;
		this.autoSync = true;
		super(attributes, options);
	}

	public trackExists (songId: string) {
		return _.has(this.get('tracks'), songId);
	}

	get name(): string {
		return this.get('name');
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

		// remove lyrics on track object since they won't be used here
		delete trackData.lyrics;

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
		properties.time_modified = Date.now();

		var tracks = this.get('tracks') || {};
		tracks[trackData.id] = _.pick(trackData,
			'id', '_id', 'album_cover_art_url', 'title', 'album_name',
			'external_url', 'song_art_image_url', 'score', 'type');
		tracks[trackData.id].type = 'track';
		tracks[trackData.id].artist_id = this.get('id') || '';

		properties.tracks = tracks;
		new Firebase(this.url()).update(properties);

		return this;
	}

	public toIndexingFormat(): IndexableObject {
		let data = super.toIndexingFormat();
		data.title = '';
		data.author = this.name || '';
		data.description = '';
		data.image_url = this.get('image_url') || '';
		data.name = this.name;
		data.lyrics_count = this.get('lyrics_count') || 0;
		data.tracks_count = this.get('tracks_count') || 0;
		data.tracks = this.get('tracks') || {};

		return data;
	}
}

export default Artist;
