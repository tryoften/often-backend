import User from '../Models/User';
import Pack from '../Models/Pack';
import ObjectMap from '../Models/ObjectMap';
import Category from '../Models/Category';
import BaseModelType from '../Models/BaseModelType';


var bmt = BaseModelType.toClass('category');
console.log('acqui');


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
//pack.syncData().then((pm) => {
//	//console.log('acqui');
//	pack.save({
//		categories: {
//			test: {
//				id: 'myuid',
//				image: 'myimage',
//				name: 'myname'
//			}
//		}
//	});
//});

//
//var titansCategory = new Category({id: 'E1iBwVKCx'});
//titansCategory.syncData().then((sd) => {
//	titansCategory.save({name: "Sharingan"});
//});


//var pack = new Pack({id: 'NksZj51kW'});
//pack.syncData().then(() => {
//	var titansCategory = new Category({id: 'E1iBwVKCx', type: 'category'});
//	titansCategory.syncData().then(() => {
//		pack.assignCategoryToItem('41TD9uDAg', titansCategory);
//	});
//
//	//pack.setTarget('/users/tester/packs/NksZj51kW');
//});
//
//var obi = new ObjectMap({id: 'E1iBwVKCx', type: 'category'});
//obi.syncModel().then((model) => {
//	obi.setTarget('NksZj51kW', 'pack', 'great!');
//	console.log('synced');
//});
//console.log('ok');
//var titansCategory = new Category({id: 'E1iBwVKCx'});
////var otherCategory = new Category({id: 'BJ8hQjK'});
//titansCategory.syncData().then(() => {
//	titansCategory.save({name: 'Titan Uprising'});
//});

//var pack = new Pack({id: 'NksZj51kW'});
//pack.syncData().then(() => {
//	pack.save();
//});
