import * as Firebase from 'firebase';
import * as _ from 'underscore';
import { firebase as FirebaseConfig} from '../config';

var trackIdsObject = JSON.parse(require('fs').readFileSync('often-prod-track-ids.json', 'utf8'));
var trackIds = Object.keys(trackIdsObject);

var BaseURL = 'https://often-prod.firebaseio.com/';

for (let trackId of trackIds) {
	var trackRef = new Firebase(BaseURL + 'tracks/' + trackId);

	trackRef.on('value', function (snap) {
		var data = snap.val();
		var trackData = _.pick(data, 'id', 'images', 'album_cover_art_url', 'title', 'album_name',
			'external_url', 'song_art_image_url', 'score', 'type');

		console.log('saving ', trackData.id);
		new Firebase(BaseURL + 'artists/' + data.artist_id + '/tracks/' + data.id).set(trackData);
	});

}

