import * as React from 'react';
import { browserHistory } from 'react-router';
import { Button, Alert, Grid, Row, Col} from 'react-bootstrap';
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

		let thirdPartyLogin = (
			<Grid fluid>
				<Row>
					<Col md={6} className="column-left-tilt">
						<Button
							className="twitter-button"
							bsStyle="primary"
							target="twitter"
							key="twitter"
							onClick={this.onThirdPartyProviderClick}
							block>
							Twitter
						</Button>
					</Col>
					<Col md={6} className="column-right-tilt">
						<Button
							className="facebook-button"
							bsStyle="primary"
							target="facebook"
							key="facebook"
							onClick={this.onThirdPartyProviderClick}
							block>
							Facebook
						</Button>
					</Col>
				</Row>
			</Grid>
		);

		let separator = (
			<Grid fluid>
				<Row className="separator-container">
					<Col md={4} className="separator-rectangle" />
					<Col md={4} className="separator-text">Or Login With</Col>
					<Col md={4} className="separator-rectangle" />
				</Row>
			</Grid>
		);


		let emailLoginForm = (
			<Form>
				<FormGroup>
					<ControlLabel>Email Address</ControlLabel>
					<FormControl
						type="email"
						placeholder="E-mail"
						onChange={this.handlePropChange}/>
				</FormGroup>

				<FormGroup>
					<ControlLabel> Password</ControlLabel>
					<FormControl
						type="password"
						placeholder="Password"
						onChange={this.handlePropChange}/>
				</FormGroup>

				<Button
					className="login-button"
					type="submit"
					onClick={this.onEmailFormSubmit}
					block>
						login
				</Button>
			</Form>
		);

		return(
			<div className="login-panel">
				<div className="panel-container">
					<div className="panel-header">
						<div className="icon"><img src="/img/fav.png"/></div>
						<h2 className="title">Welcome back!</h2>
					</div>
					<div className="panel-content container-fluid">
							{emailLoginForm}
							{separator}
							{thirdPartyLogin}
							{errorBox()}
					</div>
				</div>
			</div>
		);

	}
}
