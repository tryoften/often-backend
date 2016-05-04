import * as React from 'react';
import { browserHistory } from 'react-router';
import { Button, Alert } from 'react-bootstrap';
import Authenticator from '../Auth/Authenticator';

const thirdPartyLogins = [
	{
		style: 'primary',
		key: 'facebook',
		label: 'Facebook'
	},
	{
		style: 'info',
		key: 'twitter',
		label: 'Twitter'
	}
];

interface LoginProps extends React.Props<Login> {}


interface LoginState extends React.Props<Login> {
	authorized?: boolean;
	errorMessage?: string;
}

export default class Login extends React.Component<LoginProps, LoginState> {

	constructor(props: LoginProps, state: LoginState) {
		super(props);
		this.onThirdPartyProviderClick = this.onThirdPartyProviderClick.bind(this);
		this.redirectToHome = this.redirectToHome.bind(this);

		if (Authenticator.isAuthorized()) {
			this.redirectToHome();
		}
		this.state = {
			authorized: Authenticator.isAuthorized(),
			errorMessage: null
		};
	}

	redirectToHome() {
		browserHistory.push('/');
	}

	onThirdPartyProviderClick (e: any) {
		e.preventDefault();
		let provider = e.target.target;
		Authenticator.authenticateAndAuthorizeUser(provider).then(() => {
			if (Authenticator.isAuthorized()) {
				this.redirectToHome();
			} else {
				this.setState({
					authorized: false,
					errorMessage: 'Failed to authenticate.'
				});
			}
		}).catch( err => {
			this.setState({
				authorized: false,
				errorMessage: err.message
			});
		});
	}



	render() {


		let errorBox = () => {
			if (this.state.errorMessage) {
				return (<Alert bsStyle="danger">{this.state.errorMessage}</Alert>);
			}
		}

		return(
			<div>
				<h1>
					Login with
				</h1>
				{thirdPartyLogins.map(provider => {
					return (
					<Button
						bsStyle={provider.style}
						target={provider.key}
						key={provider.key}
						onClick={this.onThirdPartyProviderClick}
					>
						{provider.label}
					</Button>
						);
					})}
				{errorBox()}
			</div>
		);

	}
}
