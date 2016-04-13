import * as React from 'react';
import { Row, Col, Grid, ButtonToolbar, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import CategoryView from '../Components/CategoryView';
import Categories from '../../Collections/Categories';

interface CategoriesProps extends React.Props<CategoriesRoute> {
	open?: boolean;
}

interface CategoriesState extends React.Props<CategoriesRoute> {
	categories?: Categories;
}

export default class CategoriesRoute extends React.Component<CategoriesProps, CategoriesState> {
	categories: Categories;

	constructor(props: CategoriesProps) {
		super(props);
		debugger;

		this.categories = new Categories();
		this.state = {
			categories: this.categories
		};

		this.updateCollection = this.updateCollection.bind(this);
		this.categories.on('sync', this.updateCollection);
	}

	updateCollection(collection: Categories) {
		this.setState({
			categories: collection
		});
	}

	componentWillUnmount() {
		this.categories.off('sync', this.updateCollection);
	}

	render() {
		let categoryComponents = this.state.categories.map(category => {
			return (
				<Link key={category.id} to={`/category/${category.id}`}>
					<CategoryView key={category.id} model={category}></CategoryView>
				</Link>
			);
		});

		return this.props.children ? <div>{this.props.children}</div> : (
			<div className="section">
				<header className="section-header">
					<h2>Categories</h2>

					<ButtonToolbar className="pull-right">
						<Button bsStyle="primary" bsSize="small" active href="#/category">Add Category</Button>
					</ButtonToolbar>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col sm={12}>
							<div className="content">
								{categoryComponents}
							</div>
						</Col>
					</Row>
				</Grid>

			</div>
		);
	}
}
