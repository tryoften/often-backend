import Worker from './Worker';
import SearchRequestDispatcher from '../Search/SearchRequestDispatcher';
import { firebase as FirebaseConfig } from '../config';
import * as _ from 'underscore';
import Search from '../Search/Search';
import SpotifyService from '../Services/Spotify/SpotifyService';
import YouTubeService from '../Services/YouTube/YouTubeService';
import SoundCloudService from '../Services/SoundCloud/SoundCloudService';

class SearchWorker extends Worker {
	dispatcher: SearchRequestDispatcher;
	
	constructor (opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.queues.search);
		super(options);
		
		this.dispatcher = new SearchRequestDispatcher({
			search: new Search(),
			services: {
				spotify: SpotifyService,
				youtube: YouTubeService,
				soundcloud: SoundCloudService
			}
		});
	}

	process (data, progress, resolve, reject) {

		//returns a promise when all providers are resolved
		return this.dispatcher
			.process(data)
			.then(d => {
				resolve(d);
			})
			.catch(err => {
				reject(err);
			});
	}
}

export default SearchWorker;
