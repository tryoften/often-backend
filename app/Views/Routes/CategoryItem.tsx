import * as React from 'react';
import { Grid, Row, Col, Input, Thumbnail, ButtonInput } from 'react-bootstrap';
import Category from '../../Models/Category';


interface CategoryItemProps extends React.Props<CategoryItem> {
	params: {
		categoryId: string;
	}
}

interface CategoryItemState extends React.Props<CategoryItem> {
	model: Category;
}

export default class CategoryItem extends React.Component<CategoryItemProps, CategoryItemState> {

	constructor(props: CategoryItemProps) {
		super(props);

		let category = new Category({
			id: props.params.categoryId
		});

		category.fetch();

		this.state = {
			model: category
		};

		category.on('update', () => {
			this.setState({
				model: category
			})
		});

		this.handleUpdate = this.handleUpdate.bind(this);
		this.handleNameChange = this.handleNameChange.bind(this);
	}

	handleUpdate(e) {
		e.preventDefault();
		var model = this.state.model;

		//Propagate model to Firebase
		model.save();
		this.setState({model: model});
	}

	handleNameChange(e) {
		// TODO(jakub): figure out why doesn't get called
		var model = this.state.model;
		model.set('name', e.target.value);
		this.setState({model: model});
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
							<form className="updateForm" onSubmit={this.handleUpdate}>
								<Row>
									<Col xs={4}>
										<div class="image-upload">
											<Thumbnail src={this.state.model.get('image')} />
										</div>
									</Col>
									<Col xs={8}>
										<Input
											type="text"
											label="Name"
											bsSize="medium"
											placeholder={this.state.model.get('name')}
											value={this.state.model.get('name')}
											onChange={this.handleNameChange}
										/>
									</Col>
									<Col xs={8}>
										<ButtonInput type="submit" value="Update" />
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
