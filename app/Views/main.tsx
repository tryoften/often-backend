/// <reference path="../../typings/tsd.d.ts" />

import { Route, Router, IndexRedirect, browserHistory } from 'react-router';
import { render } from 'react-dom';
import * as React from 'react'; // Don't remove, components need it

import Home from './Routes/Home';
import Packs from './Routes/PacksRoute';
import Categories from './Routes/CategoriesRoute';
import PackItem from './Routes/PackItem';
import CategoryItem from './Routes/CategoryItem';
import Owners from './Routes/OwnersRoute';
import OwnerItem from './Routes/OwnerItem';
import Featured from './Routes/FeaturedRoute';
import Login from './Routes/Login';
import Logout from './Routes/Logout';
import Authenticator from './Auth/Authenticator';

function requireAuth(nextState, replace) {
	if (!Authenticator.isAuthorized()) {
		replace({
			pathname: '/login',
			state: { nextPathname: nextState.location.pathname }
		});
	}
}

render((
	<Router history={browserHistory}>
		<Route path="/login" component={Login} />
		<Route path='/' component={Home} onEnter={requireAuth}>
			<IndexRedirect to="/packs" />
			<Route path='/packs' component={Packs}>
				<Route path="/pack(/:packId)" component={PackItem} />
			</Route>
			<Route path="/categories" component={Categories}>
				<Route path="/category(/:categoryId)" component={CategoryItem} />
			</Route>
			<Route path="/owners" component={Owners}>
				<Route path="/owner(/:ownerId)" component={OwnerItem} />
			</Route>
			<Route path="/featured" component={Featured} />
			<Route path="/logout" component={Logout} />
		</Route>
	</Router>
), document.getElementById('app-container'));
