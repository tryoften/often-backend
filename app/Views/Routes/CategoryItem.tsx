import * as React from 'react';
import { Grid, Row, Col, Input, Thumbnail, ButtonInput } from 'react-bootstrap';
import Category, {CategoryAttributes} from '../../Models/Category';


interface CategoryItemProps extends React.Props<CategoryItem> {
	params: {
		categoryId: string;
	};
}

interface CategoryItemState extends React.Props<CategoryItem> {
	isNew?: boolean;
	model?: Category;
}

export default class CategoryItem extends React.Component<CategoryItemProps, CategoryItemState> {

	constructor(props: CategoryItemProps) {
		super(props);

		let isNew = false;

		var attr: CategoryAttributes = {};
		if (props.params.categoryId) {
			// instantiate new model and fetch from server
			attr.id = props.params.categoryId;
		} else {
			/* If the id of the category hasn't been passed then it most likely doesn't exist on the server. */
			/* Create placeholder images */
			attr.image = {
				small_url: 'http://placehold.it/200x200',
				large_url: 'http://placehold.it/400x400'
			};
			/* Set name to an empty string */
			attr.name = '';

			isNew = true;
		}

		let category = new Category(attr);
		category.fetch();

		this.state = {
			model: category,
			isNew: isNew
		};

		category.on('update', () => {
			this.setState({
				model: category
			});
		});

		this.handleUpdate = this.handleUpdate.bind(this);
		this.handleNameChange = this.handleNameChange.bind(this);
		this.handleSmallImageChange = this.handleSmallImageChange.bind(this);
		this.handleLargeImageChange = this.handleLargeImageChange.bind(this);

	}

	handleSmallImageChange(e) {
		var model = this.state.model;
		var imgObj = model.get('image');
		imgObj.small.url = e.target.value;
		model.set('image', imgObj);
		this.setState({model: model});
	}

	handleLargeImageChange(e) {
		var model = this.state.model;
		var imgObj = model.get('image');
		imgObj.large.url = e.target.value;
		model.set('image', imgObj);
		this.setState({model: model});
	}

	handleUpdate(e) {
		e.preventDefault();
		var model = this.state.model;
		model.save();
		this.setState({model: model, isNew: false});
	}

	handleNameChange(e) {
		var model = this.state.model;
		model.set('name', e.target.value);
		this.setState({model: model});
	}

	render() {
		return (
			<div className="section">
				<header className="section-header">
					<h2>{this.state.model.get('name')}</h2>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col xs={6}>
							<form className="updateForm" onSubmit={this.handleUpdate}>
								<Row>
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
								</Row>
								<Row>
									<Col xs={4}>
										<div class="image-upload">
											<Thumbnail src={this.state.model.get('image').small_url} />
										</div>
									</Col>
									<Col xs={8}>
										<Input
											type="text"
											label="Small Image"
											bsSize="medium"
											placeholder={this.state.model.get('image').small_url}
											value={this.state.model.get('image').small_url}
											onChange={this.handleSmallImageChange}
										/>
										<Input
											type="text"
											label="Large Image"
											bsSize="medium"
											placeholder={this.state.model.get('image').large_url}
											value={this.state.model.get('image').large_url}
											onChange={this.handleLargeImageChange}
										/>
									</Col>
								</Row>
								<Row>
									<Col xs={8}>
										<ButtonInput type="submit" value={this.state.isNew ? 'Create':'Update'} />
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
