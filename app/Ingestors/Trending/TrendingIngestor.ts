import * as http from 'http';
import { ClientResponse } from "http";
import * as cheerio from 'cheerio';
import GeniusService from "../../Services/Genius/GeniusService";
import { Service as RestService } from 'restler';

/**
 * This class gets trending artists, songs and lyrics from genius and ingests that data into storage
 */
class TrendingIngestor {
	genius: GeniusService;
	rest: RestService;

	constructor () {
		this.rest = new RestService()
	}

	ingestData () {
		this.getTrendingTracks().then(data => {
			var promises: Promise<any>[] = [];
			for (var trackData of data) {
				promises.push(this.genius.getData(trackData.id));
			}
			return promises;
		})
	}

	/**
	 * Fetches trending track ids
	 * @return {Promise} - Promise that when resolved returns the results of the data fetch, or an error if failed
	 * */
	getTrendingTracks (): Promise<any> {
		return new Promise((resolve, reject) => {
			var url = "http://genius.com/home/show_more_cards?page=1";
			http.get(url, (response) => {
				if (response.statusCode != 200) {
					reject(new Error(response.statusMessage));
					return;
				}
				var str = "";

				response.on('data', (chunk) => {
					str += chunk
				});

				response.on('end', () => {
					var $ = cheerio.load(str);

					var className = ".song_card";
					var songItems = $(className).map(function (i, el) {
						var song = {
							id: $(this).attr('data-id'),
							title: $(className + '-title', this).text(),
							artist: $(className + '-artist', this).text()
						};
						console.log(song);
						return song;
					}).get();

					resolve(songItems);
				});
			});
		});
	}

}

export default TrendingIngestor;

var trending = new TrendingIngestor();
trending.getTrendingTracks();
