import MediaItemType from '../Models/MediaItemType';
import { firebase as FirebaseConfig } from '../config';
import Firebase = require('firebase');
import Search from '../Search/Search';
var search = new Search();

var count = 0;
function getIndexablesFromId (id, type) {
	return new Promise((resolve, reject) => {
		var MediaItemClass = MediaItemType.toClass(type);
		var mediaItem = new MediaItemClass({
			id: id
		});
		mediaItem.syncData().then( synced => {
			console.log(count++);
			resolve(mediaItem.toIndexingFormat());
		});
	});
}

var artists = new Firebase(`${FirebaseConfig.BaseURL}/tracks`).limitToFirst(5000);
artists.once('value', snap => {
	var artistIds = Object.keys(snap.val());
	console.log(`Total of ${artistIds.length} ids`);
	var promises = [];
	for ( var id of artistIds ) {
		promises.push(getIndexablesFromId(id, 'track'));
	}
	Promise.all(promises).then(indexables => {
		console.log('Indexable length ' + indexables.length);
		search.index(indexables).then(resp => {
			console.log('indexed indexables');
		}).catch(err => {
			console.log(err);
		});
	}).catch( err => {
		console.log('err' + err);
	});
});
