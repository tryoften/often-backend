import * as cheerio from 'cheerio';
import GeniusService from "../../Services/Genius/GeniusService";
import { get, RequestOptions } from 'restler';
import Trending from "../../Collections/Trending";
import { GeniusData } from "../../Services/Genius/GeniusDataTypes";

/**
 * This class gets trending artists, songs and lyrics from genius and ingests that data into storage
 */
class TrendingIngestor {
	genius: GeniusService;
	trending: Trending;

	constructor () {
		this.genius = new GeniusService({
			provider_id: "genius"
		});
		this.trending = new Trending();
	}

	/**
	 * Fetches trending songs, lyrics and artists data and
	 * stores appropriate data stores.
	 */
	ingestData (): Promise<any> {
		return this.getTrendingTracks().then(data => {
			var promises: Promise<GeniusData>[] = [];
			for (var trackData of data) {
				promises.push(this.genius.getData(trackData.id));
			}

			return Promise.all(promises).then( (data: GeniusData[]) => {
				console.log(data);

				// TODO(luc): put data in trending collection
				this.trending.add({

				});
			});
		});
	}

	/**
	 * Fetches trending track ids
	 * @return {Promise} - Promise that when resolved returns the results of the data fetch, or an error if failed
	 * */
	getTrendingTracks (): Promise<any> {
		return new Promise((resolve, reject) => {
			var url = "http://genius.com/home/show_more_cards?page=1";

			get(url).on("complete", (result, response) => {
				var $ = cheerio.load(result);

				var className = ".song_card";
				var songItems = $(className).map(function (i, el) {
					var song = {
						id: $(this).attr('data-id'),
						title: $(className + '-title', this).text(),
						artist: $(className + '-artist', this).text()
					};
					return song;
				}).get();

				resolve(songItems);
			}).on("error", (err, response) => {
				reject(err);
			});

		});
	}

}

export default TrendingIngestor;

var trending = new TrendingIngestor();
trending.ingestData();
