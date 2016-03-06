import IngestionWorker from '../Workers/IngestionWorker';
var iw = new IngestionWorker();

var testTask = {
	destinations: 'firebase',
	service: 'genius',
	type: 'track',
	format: 'id',
	//data: '93539'
	ingestionOption: 'trending'
};

iw.process(testTask, null, null, null);
