import UserWorker from '../Workers/UserWorker';

var uw = new UserWorker();

var task = {
	userId: 'tester',
	type: 'initiatePacks'
};
//
//var task = {
//	userId: 'tester',
//	type: 'initiatePacks'
//};


uw.process(task, null, (x) => { console.log(x); }, (y) => { console.log(y.stack); } );

