/* Set up proper listeners */
import * as Firebase from 'firebase';
import * as _ from 'underscore';
import { firebase as FirebaseConfig } from '../config';
import { trackSchedulerOptions } from '../config';

class TrackTaskScheduler {
	tracks: any;
	tracksRef: any;
	queueRef: any;
	startTrack: string;
	limit: number;
	queueListener: any;
	taskCap: number;

	constructor () {
		this.tracks = [];
		this.tracksRef = new Firebase(trackSchedulerOptions.tracksUrl);
		console.log('Tracks Reference: ', trackSchedulerOptions.tracksUrl);

		this.queueRef = new Firebase(trackSchedulerOptions.queueUrl);
		console.log('Queue Reference: ', trackSchedulerOptions.queueUrl);

		this.limit = trackSchedulerOptions.limit;
		console.log('Limit: ', trackSchedulerOptions.limit);

		this.taskCap = trackSchedulerOptions.taskCap;
		console.log('Task Cap: ', trackSchedulerOptions.taskCap);

		this.startTrack = trackSchedulerOptions.startTrack;
		console.log('StartTrack: ', trackSchedulerOptions.startTrack);

	}

	start () {
		this.initialLoad()
			.then(() => { this.setListeners(); });
	}

	loadTracks (uncompactedArr) {
		var tracks = _.compact(uncompactedArr);
		for (var track of tracks) {
			this.tracks.push(track);
		}
	}

	initialLoad () {
		return new Promise((resolve, reject) => {
			try {
				this.tracksRef.limitToFirst(this.limit).once('value', (tracksSnap) => {
					console.log('Initial load completed');
					this.loadTracks(tracksSnap.val());
					console.log('Initial load completed. Number of tracks to be processed: ', this.tracks.length);
					this.pushNTasks(this.taskCap);
					resolve('Successfully loaded initial tracks');

				}, (err) => {
					console.log('Error when fetching tracks' + err);
					reject(err);
				});
			} catch (err) {
				console.log('Failed to load tracks' + err);
				reject(err);
			}
		});
	}


	setListeners() {
		console.log('Setting up listeners');
		this.queueListener = this.queueRef.on('child_removed', () => {

			if (this.tracks.length > 0) {
				this.removeFirstTaskAndEnqueue();
			} else {
				// Detach the listener until more tracks are fetched
				console.log('Scheduler out of tasks. About to get more...');
				console.log('Detaching queue listener');
				this.queueRef.off('child_removed', this.queueListener);
				this.getMoreTracks();
			}

		});
	}

	removeFirstTaskAndEnqueue () {
		var nextTrack = this.tracks.shift();
		console.log(`Enqueueing.. Track id: ${nextTrack} Tracks size: ${this.tracks.length}`);
		this.startTrack = nextTrack;
		this.queueRef.push({
			tracks: [nextTrack]
		});
	}

	pushNTasks (n: number) {
		if (this.tracks.length > 0) {
			console.log(`Pushing ${n} tasks onto work queue`);
			while (n > 0) {
				this.removeFirstTaskAndEnqueue();
				n--;
			}
		} else {
			console.log('Tracks array is empty.');
		}

	}

	getMoreTracks() {
		this.tracksRef.startAt(this.startTrack).limitToFirst(this.limit).once('value', (tracksSnap) => {
			console.log('Fetched more tracks');
			this.loadTracks(tracksSnap.val());
			console.log('Tracks length ', this.tracks.length);
			this.setListeners();
			this.pushNTasks(this.taskCap);
		}, (err) => {
			throw new Error('Error when fetching more tracks', err);
		});
	}

}
export default TrackTaskScheduler;

