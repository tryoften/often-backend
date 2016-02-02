import PreIngestor from '../Ingestors/Lyric/PreIngestor';
import * as Firebase from 'firebase';
import { firebase as FirebaseConfig} from '../config';

var pi = new PreIngestor();
var ref = new Firebase(`${FirebaseConfig.BaseURL}/queues/track_ingestion/tasks`);
console.log('about to get tracks');
pi.ingestPopularTracks().then((tracks) => {
	console.log('Got tracks');
	console.log(tracks.length);
	var interval = 1;
	var start = 0;
	for (; start + interval  < tracks.length; start += interval) {
		ref.push({
			tracks: tracks.slice(start, start + interval)
		});
	}
	var remaining = tracks.length % start;
	if (remaining > 0) {
		ref.push({
			tracks: tracks.slice(start, start + remaining)
		});
	}


});

