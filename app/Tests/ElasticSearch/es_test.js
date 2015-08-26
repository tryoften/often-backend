
import Search from '../../Search/search';

var s = new Search();
debugger;
s.query('red hot').then((d) => {
	console.log(d);
	//console.log(d.aggregations['top-providers'].buckets);
});
