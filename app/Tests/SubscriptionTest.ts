import User from '../Models/User';

var user = new User({id: 'tester'});


user.addPack({ packId: 'NkuOk0PRl', userId: 'tester'}).then(() => {
	user.addPack({ packId: 'testing', userId: 'tester'}).then(() => {
		console.log(true);
	}).catch((err: Error) => {
		console.log(err);
	});
}).catch((err: Error) => {
	console.log(err);
});
