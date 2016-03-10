import IngestionWorker from '../Workers/IngestionWorker';
var iw = new IngestionWorker();

var testTask = {
	destinations: 'firebase',
	service: 'genius',
	type: 'artist',
	format: 'url',
	data: {
		url: 'http://genius.com/artists/Kanye-west',
		popularTracksOnly: true
	}
	//ingestionOption: 'trending'
};

iw.process(testTask, null, null, null);
