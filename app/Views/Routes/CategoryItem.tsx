import * as React from 'react';
import { Grid, Row, Col, Input, Thumbnail, ButtonInput } from 'react-bootstrap';
import Category, { CategoryAttributes } from '../../Models/Category';
import * as objectPath from 'object-path';

interface CategoryItemProps extends React.Props<CategoryItem> {
	params: {
		categoryId: string;
	};
}

interface CategoryItemState extends React.Props<CategoryItem> {
	isNew?: boolean;
	model?: Category;
	form?: CategoryAttributes;
}

export default class CategoryItem extends React.Component<CategoryItemProps, CategoryItemState> {

	constructor(props: CategoryItemProps) {
		super(props);

		let isNew = !props.params.categoryId;
		let category = isNew ? new Category() : new Category({id: props.params.categoryId});

		this.state = {
			model: category,
			isNew: isNew,
			form: category.toJSON()
		};

		category.on('update', this.updateStateWithModel.bind(this));
		this.handleUpdate = this.handleUpdate.bind(this);
		this.handlePropChange = this.handlePropChange.bind(this);
	}

	componentDidMount() {
		this.state.model.fetch({
			success: this.updateStateWithModel.bind(this)
		});
	}

	updateStateWithModel(model: Category) {
		this.setState({
			model,
			form: model.toJSON()
		});
	}

	handlePropChange(e: any) {
		let id = e.target.id;
		let form = this.state.form;
		objectPath.set(form, id, e.target.value);
		this.setState({form});
	}

	handleUpdate(e) {
		e.preventDefault();

		let model = this.state.model;
		model.save(this.state.form);
		this.setState({model: model, isNew: false});
	}


	render() {
		return (
			<div className="section">
				<header className="section-header">
					<h2>{this.state.form.name}</h2>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col xs={6}>
							<form className="updateForm" onSubmit={this.handleUpdate}>
								<Row>
									<Col xs={8}>
										<Input
											id="name"
											type="text"
											label="Name"
											bsSize="medium"
											placeholder={this.state.form.name}
											value={this.state.form.name}
											onChange={this.handlePropChange}
										/>
									</Col>
								</Row>
								<Row>
									<Col xs={4}>
										<div class="image-upload">
											<Thumbnail src={this.state.form.image.small_url} />
										</div>
									</Col>
									<Col xs={8}>
										<Input
											id="image.small_url"
											type="text"
											label="Small Image"
											bsSize="medium"
											placeholder={this.state.form.image.small_url}
											value={this.state.form.image.small_url}
											onChange={this.handlePropChange}
										/>
										<Input
											id="image.large_url"
											type="text"
											label="Large Image"
											bsSize="medium"
											placeholder={this.state.form.image.large_url}
											value={this.state.form.image.large_url}
											onChange={this.handlePropChange}
										/>
									</Col>
								</Row>
								<Row>
									<Col xs={8}>
										<ButtonInput type="submit" value={this.state.isNew ? 'Create' : 'Save'} />
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
