import { GeniusArtistData, GeniusTrackData, GeniusLyricData } from '../Services/Genius/GeniusDataTypes';
import { MediaItem, MediaItemAttributes } from './MediaItem';
import { firebase as FirebaseConfig } from '../config';

export interface LyricAttributes extends MediaItemAttributes, GeniusLyricData {}

export class Lyric extends MediaItem {
	get text(): string {
		return this.get('text');
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
			for (let prop in track) {
				if (track.hasOwnProperty(prop)) {
					properties[`track_${prop}`] = track[prop];
				}
			}
		}

		if (artist) {
			let props = ['id', 'name', 'genius_id', 'image_url', 'is_verified', 'lyrics_count', 'score'];
			for (let prop in props) {
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
}

export default Lyric;
