import * as Firebase from 'firebase';
import * as _ from 'underscore';
import { Service as RestService } from 'restler';

var rootUrl = 'https://often-prod.firebaseio.com';
var artistIdsPath = '/Users/jdc/Documents/work/often-backend/app/Scripts/artistIds.json';

var artistIdsObj = JSON.parse(require('fs').readFileSync(artistIdsPath, 'utf8'));
var artistIds = Object.keys(artistIdsObj);

var promises = [];

for (var id of artistIds) {
	promises.push(updateArtistCounts(id));
}
Promise.all(promises).then(() => {
	console.log('all done!');
}).catch(() => {
	console.log('some failed :(');
});

function updateArtistCounts (artistId) {
	return new Promise((resolve, reject) => {
		var artistRef = new Firebase(`${rootUrl}/artists/${artistId}`);
		console.log('about to fetch');
		artistRef.once('value', (artistSnap) => {
			console.log('fetched!');
			var artist = artistSnap.val();
			var artistTracks = artist.tracks || [];
			var trackKeys = Object.keys(artistTracks);
			var tracksCount = 0;
			var lyricsCount = 0;
			for (var trackId of trackKeys) {
				let track = artistTracks[trackId];
				lyricsCount += (track.lyrics_count || 0);
				tracksCount++;
			}

			artistRef.update({
				lyrics_count: lyricsCount,
				tracks_count: tracksCount
			}, (error) => {
				if (error) {
					console.log('failed to update');
					reject(false);
				} else {
					console.log('successful update!');
					resolve(true);
				}
			});
		});
	});


}
