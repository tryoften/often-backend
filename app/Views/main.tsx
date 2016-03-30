/// <reference path="../../typings/tsd.d.ts" />

import { Route, Router, hashHistory } from 'react-router';
import { render } from 'react-dom';
import * as React from 'react';

import Home from './Routes/Home';
import Packs from './Routes/PacksRoute';
import Artists from './Routes/Artists';
import Categories from './Routes/CategoriesRoute';
import PackItem from './Routes/PackItem';
import CategoryItem from './Routes/CategoryItem';

render((
	<Router history={hashHistory}>
		<Route path='/' component={Home}>
			<Route path='/packs' component={Packs} />
			<Route path="/pack/:packId" component={PackItem} />
			<Route path="/artists" component={Artists} />
			<Route path="/categories" component={Categories} />
			<Route path="/category/:categoryId" component={CategoryItem} />
			<Route path="/category" component={CategoryItem} />
		</Route>
	</Router>
), document.getElementById('app-container'));
