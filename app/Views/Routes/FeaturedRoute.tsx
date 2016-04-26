import * as React from 'react';
import { Row, Col, Grid } from 'react-bootstrap';
import { Link } from 'react-router';
import PackView from '../Components/PackView';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Featured from '../../Models/Featured';
import MediaItemType from '../../Models/MediaItemType';
import Pack from "../../Models/Pack";

interface FeaturedPacksProps extends React.Props<FeaturedPacksRoute> {
	open?: boolean;
}

interface FeaturedPacksState extends React.Props<FeaturedPacksRoute> {
	featuredPacks: Featured;
	packs?: Pack[];
}

export default class FeaturedPacksRoute extends React.Component<FeaturedPacksProps, FeaturedPacksState> {
	featuredPacks: Featured;

	constructor(props: FeaturedPacksProps) {
		super(props);

		let featuredPacks = new Featured({id: 'featuredPacks', type: MediaItemType.pack});

		this.state = {
			featuredPacks: featuredPacks,
			packs: []
		};

		this.updateStateWithFeaturedPacks =  this.updateStateWithFeaturedPacks.bind(this);
		featuredPacks.on('update', this.updateStateWithFeaturedPacks);
		featuredPacks.syncData();
	}

	componentDidMount() {
		this.state.featuredPacks.fetch({
			success: this.updateStateWithFeaturedPacks
		});
	}

	updateStateWithFeaturedPacks(featured: Featured) {
		var packs = featured.items.map( indexableAttributes => {
			return new Pack(indexableAttributes);
		});
		this.setState({
			featuredPacks: featured,
			packs: packs
		});
	}


	render() {
		let packComponents = this.state.packs
			.map((pack, i) => {
				return (
					<Link key={pack.id} to={`/pack/${pack.id}`}>
						<PackView key={pack.id} model={pack}></PackView>
					</Link>
				);
			});

		let content = this.props.children ? <div>{this.props.children}</div> : (
			<div className="section">
				<header className="section-header">
					<h2>Featured Packs</h2>
				</header>
				<Grid fluid={true}>
				<Row>
					<Col sm={12}>
						<div className="content">
							<ReactCSSTransitionGroup
								transitionName="pack"
								transitionEnterTimeout={300}
								transitionLeaveTimeout={300}>
								{packComponents}
							</ReactCSSTransitionGroup>
						</div>
					</Col>
				</Row>
				</Grid>
			</div>
		);

		return content;
	}
}
