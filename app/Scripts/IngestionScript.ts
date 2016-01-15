import PreIngestor from '../Ingestors/Lyric/PreIngestor';
import GeniusService from '../Services/Genius/GeniusService';
import Search from '../Search/Search';

var pi = new PreIngestor();
var gs = new GeniusService({
	provider_id: 'genius'
});
var search = new Search();
//21 - 24
pi.ingestPopularTracks().then((tracks) => {
	console.log(tracks.length);
	var interval = 10;
	var forElastic = [];
	function throttleIngest(st, en) {

		var subset = tracks.slice(st, en);
		gs.ingest(subset).then( res => {
			console.log(`Ingesting from: ${st} to ${en}`);
			forElastic = forElastic.concat(res);
			if (en >= tracks.length) {
				doIngest(forElastic);
				return;
			};
			throttleIngest(en, ( (en + interval) < tracks.length) ? (en + interval) : tracks.length);
		});
	}
	throttleIngest(0, interval);
	function doIngest (arr) {
		console.log('About to index...');
		search.index(arr).then(() => {
			console.log('done!');
		});
	}
});


/**
 * Created by jdc on 1/15/16.
 */
