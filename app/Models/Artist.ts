import { firebase as FirebaseConfig } from '../config';
import * as _ from 'underscore';
import MediaItem from './MediaItem';
import { GeniusServiceResult } from '../Services/Genius/GeniusDataTypes';
import { IndexableObject } from '../Interfaces/Indexable';
import * as Firebase from 'firebase';
import * as Backbone from 'backbone';
import logger from '../logger';

interface ArtistIndexableObject extends IndexableObject {
	image_url: string;
	name: string;
	lyrics_count: number;
	tracks_count: number;
	tracks: Object[];
}

class Artist extends MediaItem {

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

	set(obj: any, options?: Backbone.ModelSetOptions): Backbone.Model {
		console.log(obj);
		return super.set(obj, options);
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
		logger.info('track to be added to artist ', artistData.name, trackData.id);

		tracks[trackData.id] = _.pick(trackData,
			'id', '_id', 'album_cover_art_url', 'title', 'album_name',
			'external_url', 'song_art_image_url', 'score', 'type');
		tracks[trackData.id].type = 'track';
		tracks[trackData.id].artist_id = this.get('id') || '';

		new Firebase(this.url()).update(properties);
		new Firebase(`${this.url()}/tracks`).update(tracks);

		return this;
	}

	public toIndexingFormat(): ArtistIndexableObject {
		let data: ArtistIndexableObject = _.extend({
			title: '',
			author: this.name || '',
			description: '',
			image_url: this.get('image_url') || '',
			name: this.name,
			lyrics_count: this.get('lyrics_count') || 0,
			tracks_count: this.get('tracks_count') || 0,
			tracks: this.get('tracks') || {}
		}, super.toIndexingFormat());

		return data;
	}
}

export default Artist;
