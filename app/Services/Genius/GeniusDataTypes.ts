import Lyric from '../../Models/Lyric';
import Track from '../../Models/Track';
import Artist from '../../Models/Artist';

interface GeniusObject {
	id?: string;
	genius_id?: string;
	external_url?: string;
}

export interface GeniusTrackData extends GeniusObject {
	title: string;
	header_image_url: string;
	song_art_image_url: string;
	hot: boolean;
	album_id?: string;
	album_name?: string;
	album_url?: string;
	album_cover_art_url?: string;
	media?: any;
}

export interface GeniusArtistData extends GeniusObject {
	name: string;
	image_url: string;
	is_verified: boolean;
}

export interface GeniusLyricData extends GeniusObject {
	text: string;
	score?: number;
	annotation_id?: string;
}

/**
 * Data for a given lyric along with the artist and track data for that lyric;
 */
export interface GeniusData {
	track: GeniusTrackData;
	artist: GeniusArtistData;
	lyrics?: GeniusLyricData[];
}

export interface GeniusServiceResult {
	track: Track;
	artist: Artist;
	lyrics: Lyric[];
}
