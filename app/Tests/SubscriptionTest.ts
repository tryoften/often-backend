import User from '../Models/User';
import Pack from '../Models/Pack';
import ObjectMap from '../Models/ObjectMap';
import Category from '../Models/Category';
//var user = new User({id: 'tester'});
//user.syncData().then(() => {
//	user.addPack({ itemId : 'NksZj51kW'}).then(() => {
//		console.log(true);
//	}).catch((err: Error) => {
//		console.log(err);
//	});
//});

//
//var pack = new Pack({id: 'NksZj51kW'});
//pack.syncData().then(() => {
//	console.log('hi');
//	pack.save({name: 'Jakubs new pack'});
//	//pack.setTarget('/users/tester/packs/NksZj51kW');
//});
//
//var obi = new ObjectMap({id: 'NksZj51kW', type: 'pack'});
//obi.syncModel().then((model) => {
//	console.log('synced');
//});


var pack = new Pack({id: 'NksZj51kW'});
pack.syncData().then(() => {
	console.log('about to save');
	pack.save({
		name: 'Jakub paq'
	});
});

var category = new Category({})

