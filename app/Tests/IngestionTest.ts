import IngestionWorker from '../Workers/IngestionWorker';
var iw = new IngestionWorker();

var testTask = {
	destinations: 'firebase',
	service: 'genius',
	type: 'artist',
	format: 'index',
	data: {
		index: '!',
		popularArtistsOnly: true,
		popularTracksOnly: true
	}
};

iw.process(testTask, null, null, null);
