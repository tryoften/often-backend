import UserWorker from '../Workers/UserWorker';

var uw = new UserWorker();

var task = {
	userId: 'tester',
	type: 'editUserPackItems',
	data: {
		operation: 'remove',
		packType: 'favorite',
		mediaItem: {
			id: '410bIQCTi2x',
			type: 'lyric'
		}
	}
};

uw.process(task, null, (x) => { console.log(x); }, (y) => { console.log(y.stack); } );

