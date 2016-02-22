import { GeniusArtistData, GeniusTrackData, GeniusLyricData } from '../Services/Genius/GeniusDataTypes';
import { MediaItem, MediaItemAttributes } from './MediaItem';
import { firebase as FirebaseConfig } from '../config';
import {IndexableObject} from '../Interfaces/Indexable';

export interface LyricAttributes extends MediaItemAttributes, GeniusLyricData {}

interface LyricIndexedObject extends IndexableObject {
	images?: any;
	text: string;
	artist_name: string;
	track_title: string;
	track_id: string;
	artist_image_url: string;
}

export class Lyric extends MediaItem {

	// TODO(jakub): create an interface for lyric that guarantees 'common' indexed fields
	get text(): string {
		return this.get('text');
	}

	get artist_name(): string {
		return this.get('artist_name');
	}

	get track_name(): string {
		return this.get('track_name');
	}

	set text(value: string) {
		this.set('text', value);
	}

	get score(): number {
		return this.get('score');
	}

	set score(value: number) {
		this.set('score', value);
	}

	constructor (attributes: LyricAttributes, options?: any) {
		this.urlRoot = `${FirebaseConfig.BaseURL}/lyrics`;
		super(attributes, options);
	}

	public setGeniusData (data: {artist?: GeniusArtistData, track?: GeniusTrackData, lyric?: GeniusLyricData}): Lyric {
		var {artist, track, lyric} = data;
		var properties: any = {};

		if (track) {
			let props = ['title'];
			for (let prop of props) {
				if (track.hasOwnProperty(prop)) {
					properties[`track_${prop}`] = track[prop];
				}
			}
		}

		if (artist) {
			let props = ['id', 'name', 'image_url'];
			for (let prop of props) {
				if (artist.hasOwnProperty(prop)) {
					properties[`artist_${prop}`] = artist[prop];
				}
			}
		}

		if (lyric) {
			properties.text = lyric.text;
		}

		this.set(properties);
		this.save();
		return this;
	}

	imageProperties(): string[] {
		return [
			'image_url',
			'artist_image_url',
			'track_song_art_image_url'
		];
	}

	public toIndexingFormat(): IndexableObject {
		let data: LyricIndexedObject = super.toIndexingFormat();
		data.title = this.track_name || '';
		data.author = this.artist_name || '';
		data.description = this.text || '';
		data.text = this.text || '';
		data.images = this.images;
		data.artist_name = this.get('artist_name') || '';
		data.track_title = this.get('track_title') || '';
		data.artist_image_url = this.get('artist_image_url') || '';

		return data;
	}
}

export default Lyric;
