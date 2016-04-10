/// <reference path="../../typings/tsd.d.ts" />

import { Route, Router, browserHistory } from 'react-router';
import { render } from 'react-dom';
import * as React from 'react'; // Don't remove, components need it

import Home from './Routes/Home';
import Packs from './Routes/PacksRoute';
import Categories from './Routes/CategoriesRoute';
import PackItem from './Routes/PackItem';
import CategoryItem from './Routes/CategoryItem';
import Owners from './Routes/OwnersRoute';
import OwnerItem from './Routes/OwnerItem';

render((
	<Router history={browserHistory}>
		<Route path='/' component={Home}>
			<Route path='/packs' component={Packs} />
			<Route path="/pack(/:packId)" component={PackItem} />
			<Route path="/categories" component={Categories} />
			<Route path="/category(/:categoryId)" component={CategoryItem} />
			<Route path="/owners" component={Owners} />
			<Route path="/owner(/:ownerId)" component={OwnerItem} />
		</Route>
	</Router>
), document.getElementById('app-container'));
