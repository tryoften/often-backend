import PreIngestor from '../Ingestors/Lyric/PreIngestor';
import * as Firebase from 'firebase';
import { firebase as FirebaseConfig} from '../config';
import * as _ from 'underscore';

var pi = new PreIngestor();
var ref = new Firebase(`${FirebaseConfig.BaseURL}/queues/preingestion/tasks`);

pi.getArtists(false).then(results => {
	for (var res of results) {
		ref.push({
			url: res
		});
	}
});
