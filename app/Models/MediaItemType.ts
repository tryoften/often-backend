import * as _ from 'underscore';

export default class MediaItemType extends String {
	static artist: MediaItemType = "artist";
	static track: MediaItemType = "track";
	static lyric: MediaItemType = "lyric";

	static allTypes: MediaItemType[] = [
		MediaItemType.artist,
		MediaItemType.track,
		MediaItemType.lyric
	];

	private static mapping: any;
	static get classMapping(): any {
		if (!MediaItemType.mapping) {
			MediaItemType.mapping = {
				artist: require('./Artist').default,
				track: require('./Track').default,
				lyric: require('./Lyric').default
			};
		}
		return MediaItemType.mapping;
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

	static toClass(type: MediaItemType): any {
		return MediaItemType.classMapping[type.toString()];
	}
};
