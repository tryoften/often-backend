import * as Firebase from 'firebase';
import {firebase as FirebaseConfig} from '../config';
let unirest = require('unirest');
let allUserIds = [];

let usersToRemoveObj = {};

function filterUser(uid): Promise<boolean> {
	return new Promise((resolve, reject) => {
		let userRef = new Firebase(`${FirebaseConfig.BaseURL}/users/${uid}`);
		userRef.once('value', (snap) => {
			if (!snap) {
				reject('Couldnt load user info');
			}
			let userData = snap.val();
			if (!userData.packs) {
				console.log('packs not found for user', uid);
				usersToRemoveObj[uid] = null;
			}
			resolve(true);
		});
	});
}

function filterUsersInSequence() {
	let promise = Promise.resolve(true);

	allUserIds.forEach((uid) => {
		promise = promise.then(() =>  filterUser(uid));
	});

	return promise;
}

function filterUsers() {
	let promises = [];
	allUserIds.forEach((uid) => {
		promises.push(filterUser(uid));
	});

	return Promise.all(promises);
}


function removeOldUsers() {
	let newUsers = new Firebase(`${FirebaseConfig.BaseURL}/users`);
	newUsers.update(usersToRemoveObj, (error) => {
		if (error) {
			console.log('Failed to remove old users', error);
		} else {
			console.log('Successfully removed old users');
		}
	});
}

function getUserIds() {
	return new Promise((resolve, reject) => {
		let request = unirest.get(`${FirebaseConfig.BaseURL}/users.json`)
			.query('shallow=true');
		request.header('Accept', 'application/json').end( (response) => {
			//Response in here
			if (response.error) {
				console.log('Error fetching user ids', response.error);
			}
			allUserIds = Object.keys(response.body);
			resolve(true);
		});
	});
}

getUserIds()
	.then(() => filterUsers())
	.then(() => {
		console.log(usersToRemoveObj);
		console.log('done');
	});
//filterUsersInSequence().then( () => removeOldUsers() );

