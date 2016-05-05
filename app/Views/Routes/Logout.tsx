import * as React from 'react';
import { browserHistory } from 'react-router';
import Authenticator from '../Auth/Authenticator';


interface LogoutProps extends React.Props<Logout> {}
interface LogoutState extends React.Props<Logout> {}

export default class Logout extends React.Component<LogoutProps, LogoutState> {

	constructor(props: LogoutProps, state: LogoutState) {
		super(props);

		this.redirectToLogin =  this.redirectToLogin.bind(this);
		this.state = {};
	}

	componentWillMount() {
		Authenticator.deauthorize();
		this.redirectToLogin();
	}

	redirectToLogin() {
		browserHistory.push('/login');
	}

	render() {
		return (<div>Logout Page</div>);
	}



}
