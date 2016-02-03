import * as Firebase from 'firebase';
import { firebase as FirebaseConfig} from '../config';
var ref = new Firebase(`${FirebaseConfig.BaseURL}/tracks`);
var imageQueue = new Firebase(`${FirebaseConfig.BaseURL}/queues/image_resizing/tasks`);
ref.on('value', snap => {
	console.log('got tracks back');
	var tracks = snap.val();
	var trackIds = Object.keys(tracks);
	for (var id of trackIds) {
		var trackData = tracks[id];
		var imageFields = [];

		if (!!trackData.artist_image_url) {
			imageFields.push('artist_image_url');
		}
		if (!!trackData.album_cover_art_url) {
			imageFields.push('album_cover_art_url');
		}
		if (!!trackData.header_image_url) {
			imageFields.push('header_image_url');
		}
		if (!!trackData.song_art_image_url) {
			imageFields.push('song_art_image_url');
		}
		var obiWonKenobi = {};
		obiWonKenobi[id] = {
			option: 'mediaitem',
			id: id,
			type: 'track',
			imageFields: imageFields
		};
		imageQueue.update(obiWonKenobi);
	}

});
