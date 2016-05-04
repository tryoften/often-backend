import * as React from 'react';
import { Router } from 'react-router';
import Authenticator from './Authenticator';
export default class LoginRequired extends React.Component<{}, {}> {

	static requireAuth(nextState, replace) {
		if (!Authenticator.isAuthorized()) {
			replace({
				pathname: '/login',
				state: { nextPathname: nextState.location.pathname }
			});
		}
	}

}
