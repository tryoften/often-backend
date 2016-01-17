import PreIngestor from '../Ingestors/Lyric/PreIngestor';
import * as Firebase from 'firebase';
import { firebase as FirebaseConfig} from '../config';

var pi = new PreIngestor();
var ref = new Firebase(`${FirebaseConfig.BaseURL}/queues/track_ingestion/tasks`);

pi.ingestPopularTracks().then((tracks) => {

	for (var track of tracks) {
		ref.push({
			trackId: track
		});
	}
});

