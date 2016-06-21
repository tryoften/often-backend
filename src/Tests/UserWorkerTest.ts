import UserWorker from '../workers/user/UserWorker';

var uw = new UserWorker();

var task = {
	userId: 'superTester',
	type: 'editUserPackItems'
};

console.log(task);
uw.process(task, null, (x) => { console.log(x); }, (y) => { console.log(y.stack); } );

