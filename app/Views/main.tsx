import * as React from 'react';
import { Route, Router, hashHistory } from 'react-router';
import { render } from 'react-dom';

import Home from './Routes/Home';
import Packs from './Routes/PacksRoute';
import Artists from './Routes/Artists';
import Categories from './Routes/Categories';
import PackItem from './Routes/PackItem';

render((
	<Router history={hashHistory}>
		<Route path='/' component={Home}>
			<Route path='/packs' component={Packs} />
			<Route path="/pack/:packId" component={PackItem} />
			<Route path="/artists" component={Artists} />
			<Route path="/categories" component={Categories} />
		</Route>
	</Router>
), document.getElementById('app-container'));
