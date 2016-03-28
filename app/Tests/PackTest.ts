import { Pack } from '../Models/Pack';

var pack = new Pack({
	id: 'test_pack',
	name: 'Pack_name'
});

var items = [

	{
		type: 'artist',
		id: '4ytWaTc2l'
	},
	{
		type: 'lyric',
		id: '41_-aTqhe'
	},
	{
		type: 'lyric',
		id: '41Ie3Zap53x'
	},
	{
		type: 'lyric',
		id: '4JNQnZapq2e'
	}
];






pack.setMediaItems(items);
