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
	var p = new Promise((resolve, reject) => {
		resolve(true);
	});
	var count = 0;
	tracks.forEach((trackId) => {
		console.log("Count: "+ count + " trackId: "+ trackId);
		count++;
		p = p.then(function(){
			return gs.ingest([trackId]);
		});
	});

});

