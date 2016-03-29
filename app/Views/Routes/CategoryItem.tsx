import * as React from 'react';
import { Grid, Row, Col, Input, Thumbnail } from 'react-bootstrap';
import Category from '../../Models/Category';
import MediaItemView from '../Components/MediaItemView';
import MediaItemType from '../../Models/MediaItemType';
import MediaItemSource from '../../Models/MediaItemSource';


interface CategoryItemProps extends React.Props<CategoryItem> {
	params: {
		cateogryId: string;
	}
}

interface CategoryItemState extends React.Props<CategoryItem> {
	model: Category;
}

export default class PackItem extends React.Component<PackItemProps, PackItemState> {

	constructor(props: PackItemProps) {
		super(props);

		let pack = new Category({
			id: props.params.categoryId
		});

		this.state = {
			model: category
		};

		category.on('update', () => {
			this.setState({
				model: category
			})
		});
	}


	render() {

		return (
			<div className="section">
				<header className="section-header">
					<h2>{this.state.model.name}</h2>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col xs={6}>
							<form>
								<Row>
									<Col xs={4}>
										<div class="image-upload">
											<Thumbnail src={this.state.model.get('image')} />
										</div>
									</Col>
									<Col xs={8}>
										<Input type="text" label="Name" bsSize="medium" placeholder="Name" value={this.state.model.name} />
									</Col>
								</Row>
							</form>
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}
}
