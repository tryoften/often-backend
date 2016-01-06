import 'backbonefire';
import { Firebase, Model } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import * as _ from 'underscore';
import { MediaItem, MediaItemAttributes } from "./MediaItem";
import { GeniusArtistData, GeniusTrackData, GeniusLyricData } from "../Services/Genius/GeniusDataTypes";

export interface LyricAttributes extends MediaItemAttributes, GeniusLyricData {}

export class Lyric extends MediaItem {
	get text(): string {
		return this.get('text');
	}

	set text(value: string) {
		this.set('text', value);
	}

	get score(): number {
		return this.get("score");
	}

	set score(value: number) {
		this.set("score", value);
	}

	constructor (attributes: LyricAttributes, options?: any) {
		this.urlRoot = `${FirebaseConfig.BaseURL}/lyrics`;
		super(attributes, options);
	}

	setGeniusData (data: {artist?: GeniusArtistData, track?: GeniusTrackData, lyric?: GeniusLyricData}): Lyric {
		var {artist, track, lyric} = data;
		var properties: any = {};

		if (track) {
			for (let prop in track) {
				properties[`track_${prop}`] = track[prop];
			}
		}

		if (artist) {
			for (let prop in artist) {
				properties[`artist_${prop}`] = artist[prop];
			}
		}

		if (lyric) {
			properties.text = lyric.text;
		}

		this.set(properties);
		return this;
	}
}

export default Lyric;
