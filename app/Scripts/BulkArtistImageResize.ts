import * as Firebase from 'firebase';
import { firebase as FirebaseConfig} from '../config';
var ref = new Firebase(`${FirebaseConfig.BaseURL}/artists`);
var imageQueue = new Firebase(`${FirebaseConfig.BaseURL}/queues/image_resizing/tasks`);
ref.on('value', snap => {
	var ids = Object.keys(snap.val());
	for (var id of ids) {
		imageQueue.push({
			option: 'mediaitem',
			id: id,
			type: 'artist',
			imageFields: ['image_url']
		});
	}

});
