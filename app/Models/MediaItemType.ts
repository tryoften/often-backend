import Artist from "./Artist";
import Lyric from "./Lyric";
import Track from "./Track";
import * as _ from 'underscore';
import MediaItem from "./MediaItem";

export default class MediaItemType extends String {
	static artist: MediaItemType = "artist";
	static track: MediaItemType = "track";
	static lyric: MediaItemType = "lyric";

	static allTypes: MediaItemType[] = [
		MediaItemType.artist,
		MediaItemType.track,
		MediaItemType.lyric
	];

	static classMapping = {
		artist: Artist,
		track: Track,
		lyric: Lyric
	};

	/**
	 * Creates a MediaItemType object from its string representation
	 *
	 * @param str
	 * @returns {MediaItemType}
	 */
	static fromType(str: string): MediaItemType {
		if (!_.contains(MediaItemType.allTypes, str)) {
			throw new Error("Cannot create MediaItemType from passed in string. You must pass in one of the defined types");
		}
		return <MediaItemType>str;
	}

	static toClass(type: MediaItemType): typeof MediaItem {
		return MediaItemType.classMapping[type.toString()];
	}
};
