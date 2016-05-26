import * as Firebase from 'firebase';
let unirest = require('unirest');
let allUserIds = [];

let usersToRemoveObj = {};

let baseUrl = 'https://jakub-test-4d7f6.firebaseio.com';

function filterUser(uid): Promise<boolean> {
	return new Promise((resolve, reject) => {
		let userRef = new Firebase(`${baseUrl}/users/${uid}`);
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

function filterUsers() {
	let promises = [];
	allUserIds.forEach((uid) => {
		promises.push(filterUser(uid));
	});

	return Promise.all(promises);
}


function removeOldUsers() {
	let newUsers = new Firebase(`${baseUrl}/users`);
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
		let request = unirest.get(`${baseUrl}/users.json`)
			.query('shallow=true');
		request.header('Accept', 'application/json').end( (response) => {
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
		console.log("To be removed: " + Object.keys(usersToRemoveObj).length);
		console.log("Total: " + allUserIds.length);
		console.log('done');
	})
	.then(() => {
		removeOldUsers();
	});


