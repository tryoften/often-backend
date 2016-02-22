import * as Firebase from 'firebase';
import * as _ from 'underscore';
import { firebase as FirebaseConfig} from '../config';

var trackIdsObject = JSON.parse(require('fs').readFileSync('often-prod-track-ids.json', 'utf8'));
var trackIds = Object.keys(trackIdsObject);

var BaseURL = 'https://often-prod.firebaseio.com/';

var count = 55642;
var totalCount = 66955;

for (let i = count; i < totalCount; i++) {
	new Firebase(BaseURL + 'tracks/' + trackIds[i]).on('value', processTrack);
}

function processTrack(snap) {
	let data = snap.val();
	let trackData = _.pick(data, 'id', 'images', 'album_cover_art_url', 'title', 'album_name',
		'external_url', 'song_art_image_url', 'score', 'type', 'lyrics_count');

	let artistTrackRef = new Firebase(BaseURL + 'artists/' + data.artist_id + '/tracks/' + data.id);
	artistTrackRef.update(trackData);

	console.log("Track ", ++count, "of ", totalCount);
	console.log(artistTrackRef.toString());
}
