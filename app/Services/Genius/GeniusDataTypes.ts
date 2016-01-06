import Lyric from "../../Models/Lyric";
import Track from "../../Models/Track";
import Artist from "../../Models/Artist";

export interface GeniusTrackData {
	id: string;
	title: string;
	url: string;
	header_image_url: string;
	song_art_image_url: string;
	hot: boolean;
	album_id?: string;
	album_name?: string;
	album_url?: string;
	album_cover_art_url?: string;
	media?: any;
}

export interface GeniusArtistData {
	id: string;
	name: string;
	url: string;
	image_url: string;
	is_verified: boolean;
}

export interface GeniusLyricData {
	id?: string;
	text: string;
	score?: number;
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
