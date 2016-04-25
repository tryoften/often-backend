import { Row, Col, Grid, ProgressBar, Nav, NavItem } from 'react-bootstrap';
import * as React from 'react';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';

export default class SidebarComponent extends React.Component<{}, {}> {
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

				<div id='avatar'>
					<Grid>
						<Row className='fg-white'>
							<Col xs={4} collapseRight>
							</Col>
							<Col xs={8} collapseLeft id='avatar-col'>
								<div style={{top: 23, fontSize: 16, lineHeight: 1, position: 'relative'}}>Anna Sanchez</div>
								<div>
									<ProgressBar id='demo-progress' value={30} min={0} max={100} color='#ffffff'/>
									<Link to='/app/lock'></Link>
								</div>
							</Col>
						</Row>
					</Grid>
				</div>
			</div>
		);
	}
}
