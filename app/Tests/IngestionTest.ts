import IngestionWorker from '../Workers/IngestionWorker';
var iw = new IngestionWorker();

var testTask = {
	destinations: 'firebase',
	service: 'genius',
	type: 'artist',
	format: 'index',
	data: {
		index: 'a',
		popularArtistsOnly: true,
		popularTracksOnly: false
	}
	//ingestionOption: 'trending'
};

iw.process(testTask, null, null, null);
