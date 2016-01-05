import 'backbonefire';
import { Firebase, Model } from 'backbone';
import { firebase as FirebaseConfig } from '../config';
import UserTokenGenerator from '../Auth/UserTokenGenerator';
import * as _ from 'underscore';
import MediaItem from "./MediaItem";
import {GeniusArtistData} from "../Services/Genius/GeniusDataTypes";
import {GeniusTrackData} from "../Services/Genius/GeniusDataTypes";
import {GeniusLyricData} from "../Services/Genius/GeniusDataTypes";

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for cached responses. 
 */
class Lyric extends MediaItem {
	/**
	 * Initializes the elastic search config model.
	 *
	 * @return {void}
	 */
	initialize () {
		this.urlRoot = `${FirebaseConfig.BaseURL}/lyrics`;
		this.autoSync = true;
		this.idAttribute = 'id';
	}

	setGeniusData (data: {artist: GeniusArtistData, track: GeniusTrackData, lyric: GeniusLyricData}) {
		var {artist, track, lyric} = data;
		var properties: any = {};
		
		for (let prop in track) {
			properties[`track_${prop}`] = track[prop];
		}

		for (let prop in artist) {
			properties[`artist_${prop}`] = artist[prop];
		}
		properties.text = lyric.text;

		this.set(properties);

		return this.attributes;
	}

}

export default Lyric;
