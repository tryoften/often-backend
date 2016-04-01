import * as React from 'react';
import * as classNames from 'classnames';
import { Row, Col, Grid, ButtonToolbar, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import OwnerView from '../Components/OwnerView';
import Owners from '../../Collections/Owners';

interface OwnersProps extends React.Props<OwnersRoute> {
	open?: boolean;
}

interface OwnersState extends React.Props<OwnersRoute> {
	owners?: Owners;
}

export default class OwnersRoute extends React.Component<OwnersProps, OwnersState> {
	owners: Owners;

	constructor(props: OwnersProps) {
		super(props);

		this.owners = new Owners();
		this.state = {
			owners: this.owners
		};

		this.owners.on('update', () => {
			this.setState({
				owners: this.owners
			});
		});
	}

	render() {
		let ownerComponents = this.state.owners.map(owner => {
			return (
				<Link key={owner.id} to={`/owner/${owner.id}`}>
					<OwnerView key={owner.id} model={owner}></OwnerView>
				</Link>
			);
		});

		return (
			<div className="section">
				<header className="section-header">
					<h2>Owners</h2>

					<ButtonToolbar className="pull-right">
						<Button bsStyle="primary" bsSize="small" active href="#/owner">Add Owner</Button>
					</ButtonToolbar>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col sm={12}>
							<div className="content">
								{ownerComponents}
							</div>
						</Col>
					</Row>
				</Grid>

			</div>
		);
	}
}
