import Worker from './Worker';
import SearchRequestDispatcher from '../Search/SearchRequestDispatcher';
import { firebase as FirebaseConfig } from '../config';
import * as _ from 'underscore';
import Search from '../Search/Search';
import SpotifyService from '../Services/Spotify/SpotifyService';
import YouTubeService from '../Services/YouTube/YouTubeService';
import SoundCloudService from '../Services/SoundCloud/SoundCloudService';
import GeniusService from '../Services/Genius/GeniusService';
import Request from "../Models/Request";
import {Requestable} from "../Interfaces/Requestable";

class SearchWorker extends Worker {
	dispatcher: SearchRequestDispatcher;
	
	constructor (opts = {}) {
		let options = _.defaults(opts, FirebaseConfig.queues.search);
		super(options);
		
		this.dispatcher = new SearchRequestDispatcher({
			search: new Search(),
			services: {
				genius: GeniusService
			}
		});
	}

	process (data, progress, resolve, reject) {
		var request = new Request(<Requestable>data)
		//returns a promise when all providers are resolved
		return this.dispatcher
			.process(request)
			.then(d => {
				resolve(d);
			})
			.catch(err => {
				reject(err);
			});
	}
}

export default SearchWorker;
