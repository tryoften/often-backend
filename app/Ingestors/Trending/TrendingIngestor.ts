import * as cheerio from 'cheerio';
import * as _ from 'underscore';
import GeniusService from '../../Services/Genius/GeniusService';
import Lyric from '../../Models/Lyric';
import { get } from 'restler';
import { GeniusServiceResult } from '../../Services/Genius/GeniusDataTypes';
import Search from '../../Search/Search';
import Trending from '../../Models/Trending';
import { TrackId } from '../../Workers/IngestionWorker';
import MediaItem from '../../Models/MediaItem';
import MediaItemType from '../../Models/MediaItemType';

/**
 * This class gets trending artists, songs and lyrics from genius and ingests that data into storage
 */
class TrendingIngestor {
	private genius: GeniusService;
	private search: Search;
	private trending: Trending;

	constructor () {
		this.genius = new GeniusService({
			provider_id: 'genius'
		});
		this.search = new Search();
		this.trending = new Trending();
	}

	public getTrendingTrackIds(): Promise<TrackId[]> {
		return new Promise((resolve, reject) => {
			var tracks = [];
			this.getTrendingTracks().then( data => {
				for (var trackData of data) {
					tracks.push(trackData.id);
				}
				resolve(tracks);
			});

		});
	}

	public updateTrendingWithMediaItems (mediaItems: MediaItem[]) {
		return new Promise( (resolve, reject) => {
			// Spread array on type and in indexing format
			var artistResults = [];
			var trackResults = [];
			var lyricResults = [];

			for (let item of mediaItems) {
				if (item.type === MediaItemType.artist) {
					artistResults.push(item);
				}

				if (item.type === MediaItemType.track) {
					trackResults.push(item);
				}
				if (item.type === MediaItemType.lyric) {
					lyricResults.push(item);
				}
			}

			let topArtists = _.chain(artistResults)
				.map(result => result.toIndexingFormat())
				.uniq(artist => artist.id)
				.uniq(artist => artist.name)
				.value();

			let topTracks = _.map(trackResults, result => result.toIndexingFormat());

			let sortedLyricItems = lyricResults.sort((a, b) => {
				return b.score - a.score;
			});
			var trendingLyrics = _.map(sortedLyricItems, result => result.toIndexingFormat());

			//let trendingLyrics = _.map(lyricResults, result => {
            //
			//	let sortedLyrics: Lyric[] = result.sort((a, b) => {
			//		return b.score - a.score;
			//	});
            //
			//	return sortedLyrics[0].toIndexingFormat();
			//});

			var response = [
				{
					id: 'trendingLyrics',
					title: 'Trending Lyrics',
					type: 'lyric',
					items: trendingLyrics,
					score: 5.0
				},
				{
					id: 'topArtists',
					title: 'Top Artists',
					type: 'artist',
					items: topArtists,
					score: 3.0
				},
				{
					id: 'topTracks',
					title: 'Top Tracks',
					type: 'track',
					items: topTracks,
					score: 1.0
				}
			];

			this.trending.set(response);
			resolve(mediaItems);
		});

	}

	/**
	 * Fetches trending track ids
	 * @return {Promise} - Promise that when resolved returns the results of the data fetch, or an error if failed
	 * */
	public getTrendingTracks (pages = 2): Promise<any> {
		let urlTemplate = 'http://genius.com/home/show_more_cards?page=';
		let songs = [];
		let count = 1;

		return new Promise((resolve, reject) => {
			let handlePayload = (currentSongs) => {
				songs = songs.concat(currentSongs);

				if (count >= pages) {
					resolve(songs);
					return;
				}

				let nextURL = urlTemplate + (++count);

				for (let currentSong of currentSongs) {
					nextURL += ('&exclude[]=' + currentSong.id);
				}
				nextURL = encodeURI(nextURL);

				this.getPage(nextURL).then(handlePayload);
			};

			this.getPage(urlTemplate + count).then(handlePayload);
		});
	}

	/**
	 * Gets an individual page of genius trending songs
	 * @param url The page URL
	 * @returns {Promise<T>}
     */
	private getPage(url: string): Promise<any> {
		return new Promise((resolve, reject) => {

			get(url).on('complete', (result, response) => {
				let $ = cheerio.load(result);

				let className = '.song_card';
				let songItems = $(className).map(function (i, el) {
					let song = {
						id: $(this).attr('data-id'),
						artist: $(className + '-artist', this).text(),
						title: $(className + '-title', this).text()
					};
					return song;
				}).get();

				resolve(songItems);
			}).on('fail', (err, response) => {
				reject(err);
			}).on('error', (err, response) => {
				reject(err);
			});

		});
	}
}

export default TrendingIngestor;
