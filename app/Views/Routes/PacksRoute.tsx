import * as React from 'react';
import { Row, Col, Grid, ButtonToolbar, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import PackView from '../Components/PackView';
import Packs from '../../Collections/Packs';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';

interface PacksProps extends React.Props<PacksRoute> {
	open?: boolean;
}

interface PacksState extends React.Props<PacksRoute> {
	packs?: Packs;
}

export default class PacksRoute extends React.Component<PacksProps, PacksState> {
	packs: Packs;

	constructor(props: PacksProps) {
		super(props);

		this.packs = new Packs();
		this.state = {
			packs: this.packs
		};

		this.packs.on('update', () => {
			this.setState({
				packs: this.packs
			});
		});
	}

	render() {
		let packComponents = this.state.packs.map(pack => {
			return (
				<Link key={pack.id} to={`/pack/${pack.id}`}>
					<PackView key={pack.id} model={pack}></PackView>
				</Link>
			);
		});


		return (
			<div className="section">
				<header className="section-header">
					<h2>Packs</h2>

					<ButtonToolbar className="pull-right">
						<Button bsStyle="primary" bsSize="small" active>Add Pack</Button>
					</ButtonToolbar>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col sm={12}>
							<div className="content">
								<ReactCSSTransitionGroup transitionName="pack" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
									{packComponents}
								</ReactCSSTransitionGroup>
							</div>
						</Col>
					</Row>
				</Grid>

			</div>
		);
	}
}
