/**
 * Created by jakubcichon on 8/11/16.
 */
let firebase = require('firebase');
import { firebase as FirebaseConfig } from '../config';
import { User } from '@often/often-core';
let firebaseApp = firebase.initializeApp(FirebaseConfig.credentials);
let updObj = {};

let user = new User({ id: 'often'});
user.syncData().then( (syncedUser: User) => {
	let oftenUser = syncedUser.getTargetObjectProperties();
	let packsRef = firebaseApp.database().ref('/packs');
	packsRef.once('value', (snap) => {
		let allPacks = snap.val();
		let allIds = Object.keys(allPacks);
		for (let id of allIds) {
			let pack = allPacks[id];
			if (!pack.isFavorites && !pack.isRecents) {
				updObj[`${id}/owner`] = oftenUser;
			}
		}
		packsRef.update(updObj);
	});
});
