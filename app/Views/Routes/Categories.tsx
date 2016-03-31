import * as React from 'react';
import { Row, Col, Grid, ButtonToolbar, Button } from 'react-bootstrap';
import SearchPanel from '../Components/SearchPanel';

interface CategoriesProps extends React.Props<Categories> {
	open?: boolean;
}

export default class Categories extends React.Component<CategoriesProps, {}> {
	render() {
		return (
			<div className="section">
				<header className="section-header">
					<h2>Categories!</h2>

					<ButtonToolbar className="pull-right">
						<Button bsStyle="primary" bsSize="small" active>Add Category</Button>
					</ButtonToolbar>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col sm={12}>
							<div className="content">
								<SearchPanel show={true} />
							</div>
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}
}
