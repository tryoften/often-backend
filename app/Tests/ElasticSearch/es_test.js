debugger;
import Requests from '../../Collections/Requests';

var reqs = new Requests();

reqs.once('sync',(d) => {
	console.log(d);
});
/*
import Search from '../../Search/search';

var s = new Search();
debugger;
s.query('red hot').then((d) => {
	console.log(d);
});
*/