import Featured from '../Models/Featured';
import MediaItemType from "../Models/MediaItemType";
import Pack from "../Models/Pack";

var featured = new Featured({
	id: 'featuredPacks',
	type: MediaItemType.pack
});

var pack = new Pack({id: 'NksZj51kW', type: MediaItemType.pack});
pack.syncData().then((syncedPack) => {
	featured.syncData().then((synced) => {
		featured.removeFeaturedItem(pack.id);
	});
});

