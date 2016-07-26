import { firebase as FirebaseConfig } from './config';

const firebase = require('firebase');

try {
	var main = firebase.initializeApp(FirebaseConfig.credentials);
	console.log("Initialized Firebase (main)", FirebaseConfig.credentials);
} catch (e) {
	console.log("Database already initialized", e);
}

export default main;
