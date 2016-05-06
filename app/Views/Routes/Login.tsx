import * as React from 'react';
import { browserHistory } from 'react-router';
import { Button, Alert, Col} from 'react-bootstrap';
import Authenticator from '../../Models/Authenticator';


// TODO(jakub): Create proper typings for these
var Form = require('react-bootstrap/lib/Form');
var FormGroup = require('react-bootstrap/lib/FormGroup');
var FormControl = require('react-bootstrap/lib/FormControl');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');

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
	email?: string;
	password?: string;
}

export default class Login extends React.Component<LoginProps, LoginState> {

	constructor(props: LoginProps, state: LoginState) {
		super(props);
		this.onThirdPartyProviderClick = this.onThirdPartyProviderClick.bind(this);
		this.onEmailFormSubmit = this.onEmailFormSubmit.bind(this);
		this.redirectToHome = this.redirectToHome.bind(this);
		this.setAuthState = this.setAuthState.bind(this);
		this.handlePropChange = this.handlePropChange.bind(this);

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

	setAuthState() {
		if (Authenticator.isAuthorized()) {
			this.redirectToHome();
		} else {
			this.setState({
				authorized: false,
				errorMessage: 'Failed to authenticate.'
			});
		}
	}

	unsetAuthState(errMessage: string) {
		this.setState({
			authorized: false,
			errorMessage: errMessage
		});
	}


	onThirdPartyProviderClick (e: any) {
		e.preventDefault();
		let provider = e.target.target;
		Authenticator.authWithProvider(provider)
			.then(() => this.setAuthState())
			.catch( err => this.unsetAuthState(err.message));
	}

	onEmailFormSubmit (e: any) {
		e.preventDefault();
		Authenticator.authWithPassword({
			email: this.state.email,
			password: this.state.password
		})
			.then(() => this.setAuthState())
			.catch( err => this.unsetAuthState(err.message));
	}

	handlePropChange(e: any) {
		let id = e.target.id;
		let prop = {};
		prop[id] = e.target.value;
		this.setState(prop);
	}

	render() {


		let errorBox = () => {
			if (this.state.errorMessage) {
				return (<Alert bsStyle="danger">{this.state.errorMessage}</Alert>);
			}
		};

		let thirdPartyLogin = thirdPartyLogins.map(provider => {
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
		});

		let emailLoginForm = (
			<Form horizontal>
				<FormGroup>
					<Col componentClass={ControlLabel} sm={2}>
						Email
					</Col>
					<Col sm={10}>
						<FormControl
							id="email"
							type="email"
							placeholder="E-mail"
							onChange={this.handlePropChange}
						/>
					</Col>
				</FormGroup>

				<FormGroup>
					<Col componentClass={ControlLabel} sm={2}>
						Password
					</Col>
					<Col sm={10}>
						<FormControl
							id="password"
							type="password"
							placeholder="Password"
							onChange={this.handlePropChange}
						/>
					</Col>
				</FormGroup>

				<FormGroup>
					<Col smOffset={2} sm={10}>
						<Button
							type="submit"
							onClick={this.onEmailFormSubmit}
						>
							Log In
						</Button>
					</Col>
				</FormGroup>
			</Form>
		);

		return(
			<div>
				{emailLoginForm}
				{thirdPartyLogin}
				{errorBox()}
			</div>
		);

	}
}
