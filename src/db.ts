import { firebase as FirebaseConfig } from './config';

const firebase = require('firebase');

var main = firebase.initializeApp(FirebaseConfig.credentials);
console.log("Initialized Firebase (main)", FirebaseConfig.credentials);

export default main;
