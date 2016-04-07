import User from '../Models/User';

var user = new User({id: 'tester'});

user.syncData().then(() => {
	user.addPack({ itemId : 'NksZj51kW'}).then(() => {
		console.log(true);
	}).catch((err: Error) => {
		console.log(err);
	});
});
