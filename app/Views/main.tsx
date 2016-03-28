import * as React from 'react';
import { Route, Router, browserHistory } from 'react-router';
import { render } from 'react-dom';

import Home from './Routes/Home';
import Packs from './Routes/Packs';
import Artists from './Routes/Artists';
import Categories from './Routes/Categories';

render((
	<Router history={browserHistory}>
		<Route path='/' component={Home}>
			<Route path='/packs' component={Packs} />
			<Route path="/artists" component={Artists} />
			<Route path="/categories" component={Categories} />
		</Route>
	</Router>
), document.getElementById('app-container'));
