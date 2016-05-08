import * as React from 'react';
import { Row, Col, Grid, ButtonToolbar, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import UserView from '../Components/UserView';
import Users from '../../Collections/Users';

interface UsersProps extends React.Props<UsersRoute> {
	open?: boolean;
}

interface UsersState extends React.Props<UsersRoute> {
	users?: Users;
}

export default class UsersRoute extends React.Component<UsersProps, UsersState> {
	users: Users;

	constructor(props: UsersProps) {
		super(props);

		this.users = new Users();
		this.state = {
			users: this.users
		};

		this.users.on('update', () => {
			this.setState({
				users: this.users
			});
		});
	}

	render() {
		let userComponents = this.state.users.map(user => {
			return (
				<Link key={user.id} to={`/user/${user.id}`}>
					<UserView key={user.id} model={user}></UserView>
				</Link>
			);
		});

		return this.props.children ? <div>{this.props.children}</div> : (
			<div className="section">
				<header className="section-header">
					<h2>Users</h2>

					<ButtonToolbar className="pull-right">
						<Link to="/user">
							<Button bsStyle="primary" bsSize="small" active>Add User</Button>
						</Link>
					</ButtonToolbar>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col sm={12}>
							<div className="content">
								{userComponents}
							</div>
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}
}
