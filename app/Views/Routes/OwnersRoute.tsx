import * as React from 'react';
import { Row, Col, Grid, ButtonToolbar, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import OwnerView from '../Components/OwnerView';
import Owners from '../../Collections/Owners';
import PaginationControl from '../Components/PaginationControl';

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
		let ownerComponents = this.state.owners.sortBy('name').map(owner => {
			return (
				<Link key={owner.id} to={`/owner/${owner.id}`}>
					<OwnerView key={owner.id} model={owner}></OwnerView>
				</Link>
			);
		});

		return this.props.children ? <div>{this.props.children}</div> : (
			<div className="section">
				<header className="section-header">
					<h2>Owners</h2>

					<ButtonToolbar className="pull-right">
						<Link to="/owner">
							<Button bsStyle="primary" bsSize="small" active>Add Owner</Button>
						</Link>
					</ButtonToolbar>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col sm={12}>
							<div className="content">
								<PaginationControl items={ownerComponents} pageSize={20} />
							</div>
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}
}
