import { Row, Col, Grid, ProgressBar, Nav, NavItem } from 'react-bootstrap';
import * as React from 'react';
import { Link } from 'react-router';
import Authenticator from '../../Models/Authenticator';
import { LinkContainer } from 'react-router-bootstrap';
import User from '../../Models/User';


interface SidebarComponentState extends React.Props<SidebarComponent> {
	user?: User;
}

export default class SidebarComponent extends React.Component<{}, SidebarComponentState> {
	constructor() {
		super();

		this.state = {
			user: Authenticator.getAuthorizedUser()
		};
	}

	onNavChange(selectedKey) {
		console.log(selectedKey);
	}

	render() {
		return (
			<div id='sidebar'>
				<div id='brand'>
					<div id='logo'>Often</div>
				</div>

				<div id='sidebar-container'>
					<Nav stacked onSelect={this.onNavChange}>
						<LinkContainer to="/packs">
							<NavItem eventKey="packs">Packs</NavItem>
						</LinkContainer>
						<LinkContainer to="/categories">
							<NavItem eventKey="categories">Categories</NavItem>
						</LinkContainer>
						<LinkContainer to="/owners">
							<NavItem eventKey="owners">Owners</NavItem>
						</LinkContainer>
						<LinkContainer to="/featured">
							<NavItem eventKey="featured">Featured</NavItem>
						</LinkContainer>
					</Nav>
				</div>

				<div className='avatar'>
					<div className='profile-image' style={{backgroundImage: `url(${this.state.user.get('profileImageLarge')})`}}></div>
					<div className='name'>{this.state.user.get('name')}</div>
					<div className='logout'>
						<Link to='/logout'>Logout</Link>
					</div>
				</div>
			</div>
		);
	}
}
