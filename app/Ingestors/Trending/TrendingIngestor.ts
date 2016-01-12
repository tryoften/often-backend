import * as cheerio from 'cheerio';
import * as _ from 'underscore';
import Trending from '../../Models/Trending';
import GeniusService from '../../Services/Genius/GeniusService';
import Lyric from '../../Models/Lyric';
import { get } from 'restler';
import { GeniusServiceResult } from '../../Services/Genius/GeniusDataTypes';
import uniq = require('lodash/array/uniq');

/**
 * This class gets trending artists, songs and lyrics from genius and ingests that data into storage
 */
class TrendingIngestor {
	private genius: GeniusService;
	private trending: Trending;

	constructor () {
		this.genius = new GeniusService({
			provider_id: 'genius'
		});
		this.trending = new Trending();
	}

	/**
	 * Fetches trending songs, lyrics and artists data and
	 * stores appropriate data stores.
	 */
	public ingestData (): Promise<any> {
		return this.getTrendingTracks().then(data => {
			let promises: Promise<GeniusServiceResult>[] = [];
			for (let trackData of data) {
				promises.push(this.genius.getData(trackData.id));
			}

			return Promise.all(promises).then( (results: GeniusServiceResult[]) => {

				let topArtists = _.chain(results)
					.map(result => result.artist.toIndexingFormat())
					.value();

				topArtists = uniq(topArtists, artist => {
					console.log(artist.id);
					return artist.id;
				});

				let topTracks = _.map(results, result => result.track.toIndexingFormat());

				let trendingLyrics = _.map(results, result => {

					let sortedLyrics: Lyric[] = result.lyrics.sort((a, b) => {
						return b.score - a.score;
					});

					return sortedLyrics[0].toIndexingFormat();
				});

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
			}).catch((error) => {
				console.log(error);
			});
		});
	}

	/**
	 * Fetches trending track ids
	 * @return {Promise} - Promise that when resolved returns the results of the data fetch, or an error if failed
	 * */
	private getTrendingTracks (): Promise<any> {
		return new Promise((resolve, reject) => {
			let url = 'http://genius.com/home/show_more_cards?page=1';

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
			}).on('error', (err, response) => {
				reject(err);
			});

		});
	}

}

export default TrendingIngestor;

var trending = new TrendingIngestor();
trending.ingestData();
