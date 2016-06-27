import { Packs } from '@often/often-core';

let packs = new Packs();
function updatePacks(results: any){
	console.log('results');
}
packs.fetch({
	success: updatePacks
});


//let pack = new Pack({
//	id: 'VknZlt2WW'
//}, {
//	autoSync: false,
//	setObjectMap: true,
//	rootURL: 'https://jakub-test-4d7f6.firebaseio.com'
//});
//
//pack.syncData().then(synced => {
//	console.log('did the sync');
//	console.log(pack.url.toString());
//});

