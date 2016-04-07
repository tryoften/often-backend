import User from '../Models/User';

var user = new User({id: 'tester'});

user.syncData().then(()=> {
	user.addPack({itemId: 'NkuOk0PRl'}).then(() => {
		user.addPack({itemId: 'testing'}).then(() => {
			console.log(true);
		}).catch((err:Error) => {
			console.log(err);
		});
	}).catch((err:Error) => {
		console.log(err);
	});
});
