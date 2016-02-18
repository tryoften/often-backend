/* Set up proper listeners */
import * as Firebase from 'firebase';
import * as _ from 'underscore';
import { firebase as FirebaseConfig } from '../config';
import { trackSchedulerOptions } from '../config';
import logger from '../logger';

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
		logger.log('Tracks Reference: ', trackSchedulerOptions.tracksUrl);

		this.queueRef = new Firebase(trackSchedulerOptions.queueUrl);
		logger.log('Queue Reference: ', trackSchedulerOptions.queueUrl);

		this.limit = trackSchedulerOptions.limit;
		logger.log('Limit: ', trackSchedulerOptions.limit);

		this.taskCap = trackSchedulerOptions.taskCap;
		logger.log('Task Cap: ', trackSchedulerOptions.taskCap);

		this.startTrack = trackSchedulerOptions.startTrack;
		logger.log('StartTrack: ', trackSchedulerOptions.startTrack);

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
		logger.log('Setting up listeners');
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
		logger.log(`Enqueueing.. Track id: ${nextTrack} Tracks size: ${this.tracks.length}`);
		this.startTrack = nextTrack;
		this.queueRef.push({
			tracks: [nextTrack]
		});
	}

	pushNTasks (n: number) {
		if (this.tracks.length > 0) {
			logger.log(`Pushing ${n} tasks onto work queue`);
			while (n > 0) {
				this.removeFirstTaskAndEnqueue();
				n--;
			}
		} else {
			logger.log('Tracks array is empty.');
		}

	}

	getMoreTracks () {
		this.tracksRef.startAt(this.startTrack).limitToFirst(this.limit).once('value', (tracksSnap) => {
			logger.log('Fetched more tracks');
			this.loadTracks(tracksSnap.val());
			logger.log('Tracks length ', this.tracks.length);
			this.setListeners();
			this.pushNTasks(this.taskCap);
		}, (err) => {
			throw new Error('Error when fetching more tracks', err);
		});
	}

}
export default TrackTaskScheduler;

