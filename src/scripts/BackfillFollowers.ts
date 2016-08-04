var firebase = require('firebase');
import { firebase as FirebaseConfig} from '../config';
let regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
var main = firebase.initializeApp(FirebaseConfig.credentials);
import { Pack } from '@often/often-core';
/*
//Removes anonymous users from pack subscriptions
main.database().ref('subscriptions/pack').once('value', snap => {
	let packs = snap.val();
	let packIds = Object.keys(packs);
	let updateObj = {};
	for (let packId of packIds) {
		let pack = packs[packId];
		let userIds = Object.keys(pack);
		for (let uid of userIds) {
			let isAnonymous = regex.test(uid);
			console.log(`${uid}	${isAnonymous}`);
			if (isAnonymous) {
				updateObj[`${packId}/${uid}`] = null;
			}
		}
	}
	main.database().ref('subscriptions/pack').update(updateObj);

});

*/
/*
// Updates followersCount on packs
main.database().ref('subscriptions/pack').once('value', snap => {
	let packs = snap.val();
	let packIds = Object.keys(packs);
	let promises = [];
	for (let packId of packIds) {
		let pack = packs[packId];
		let numFollowers = Object.keys(pack).length;
		let p = new Pack({id: packId});
		promises.push(p.syncData().then(p => {
			console.log(numFollowers);
			p.save({
				followersCount: numFollowers
			});
		}));
	}

});
*/
