import * as _ from 'underscore';
import * as React from 'react';
import * as ReactRouter from 'react-router';
import * as classNames from 'classnames';
import * as objectPath from 'object-path';
import Categories from '../../Collections/Categories';
import { Grid, Row, Col, Thumbnail, Glyphicon, ButtonGroup, Button } from 'react-bootstrap';
import Pack, { PackAttributes, IndexablePackItem } from '../../Models/Pack';
import AddItemToPackModal from '../Components/AddItemToPackModal';
import DeleteButton from '../Components/DeleteButton';
import Category from '../../Models/Category';
import CategoryAssignmentItem from '../Components/CategoryAssignmentItem';
import CategoryAssignmentMenu from '../Components/CategoryAssignmentMenu';
import PaginationControl from '../Components/PaginationControl';

const FormGroup = require('react-bootstrap/lib/FormGroup');
const FormControl = require('react-bootstrap/lib/FormControl');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');
const InputGroup = require('react-bootstrap/lib/InputGroup');

interface PackItemProps extends React.Props<PackItem> {
	params: {
		packId: string;
	};
}

interface PackItemState extends React.Props<PackItem> {
	model?: Pack;
	shouldShowSearchPanel?: boolean;
	display?: boolean;
	isNew?: boolean;
	form?: PackAttributes;
	categories?: Categories;
}

export default class PackItem extends React.Component<PackItemProps, PackItemState> {
	static contextTypes: React.ValidationMap<any> = {
		router: React.PropTypes.object
	};

	context: {
		router: ReactRouter.RouterOnContext;
	};

	constructor(props: PackItemProps) {
		super(props);

		let isNew = !props.params.packId;
		let pack = isNew ? new Pack() : new Pack({
			id: props.params.packId
		});

		let categories = new Categories();

		this.state = {
			model: pack,
			categories: categories,
			form: pack.toJSON(),
			shouldShowSearchPanel: false,
			display: false,
			isNew: isNew
		};

		this.updateStateWithPack = this.updateStateWithPack.bind(this);
		this.handlePropChange = this.handlePropChange.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
		this.onClickAddItem = this.onClickAddItem.bind(this);
		this.togglePublish = this.togglePublish.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onUpdatePackItems = this.onUpdatePackItems.bind(this);
		this.updateStateWithCategories = this.updateStateWithCategories.bind(this);
		this.onClickRemoveItem = this.onClickRemoveItem.bind(this);

		pack.on('update', this.updateStateWithPack);
		categories.on('update', this.updateStateWithCategories);
		pack.syncData();
	}

	onClickCategory(itemId: string, category: Category, e: Event) {
		e.preventDefault();

		var model = this.state.model;
		model.assignCategoryToItem(itemId, category);
		this.setState({
			model: model
		});

	}
	onClickRemoveItem(item: IndexablePackItem, e: Event) {
		console.log(item);

		let model = this.state.model;
		model.removeItem(item);

		this.setState({
			model: model
		});
	}

	updateStateWithCategories(categories: Categories) {
		this.setState({categories});
	}

	componentDidMount() {
		this.state.model.fetch({
			success: this.updateStateWithPack
		});
		this.state.categories.fetch({
			success: this.updateStateWithCategories
		});
	}

	updateStateWithPack(pack: Pack) {
		this.setState({
			model: pack,
			form: pack.toJSON(),
			display: true
		});
	}

	onClickAddItem(e: Event) {
		e.preventDefault();

		this.setState({
			shouldShowSearchPanel: true
		});
	}

	onUpdatePackItems(packItems: IndexablePackItem[]) {

		let model = this.state.model;
		model.save({
			items: packItems
		});

		this.setState({
			model: model,
			form: model.toJSON(),
			shouldShowSearchPanel: false
		});
	}

	handlePropChange(e: any) {
		let target = e.target;
		let id = target.id;
		let form = this.state.form;
		let value = target.value;

		switch (target.type) {
			case 'number':
				value = parseFloat(value);
				break;
			case 'checkbox':
				value = target.checked;
				break;
			default:
				break;
		}

		objectPath.set(form, id, value);
		this.setState({form});
	}

	handleUpdate(e) {
		e.preventDefault();

		let model = this.state.model;
		let form = this.state.form;

		var diff = model.featured !== form.featured;
		model.save(this.state.form);
		/* Check if there's a discrepancy between featured flag on model and form */
		if (diff) {
			model.updateFeatured();
		}
		this.setState({model: model, isNew: false, form: model.toJSON()});

	}

	togglePublish(e) {
		let form = this.state.form;
		form.published = !form.published;
		form.publishedTime = new Date().toISOString();
		this.setState({form});
		this.handleUpdate(e);
	}

	onDelete(e) {
		this.state.model.save({
			deleted: true
		});
		this.context.router.push('/packs');
	}

	render() {
		let classes = classNames("section pack-item", {hidden: !this.state.display});
		let form = this.state.form;
		let categoryMenu = <CategoryAssignmentMenu categories={this.state.categories.models}
			onClickCategory={this.onClickCategory} />;

		let items = this.state.model.items.map( (item, index) => {
			return (
				<CategoryAssignmentItem
					item={item}
					categories={this.state.categories}
					onClickCategory={this.onClickCategory}
					onClickRemoveItem={this.onClickRemoveItem}
					categoryMenu={categoryMenu}
					index={index}
					key={index}/>
			);
		});

		return (
			<div className={classes}>
				<header className="section-header">
					<h2>{this.state.model.name}</h2>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col xs={12} md={8}>
							<Row>
								<Col xs={12} md={8}>
									<FormGroup>
										<ControlLabel>Name</ControlLabel>
										<FormControl
											id="name"
											type="text"
											placeholder="Enter Name"
											value={form.name}
											onChange={this.handlePropChange}/>
									</FormGroup>
									<FormGroup>
										<ControlLabel>Description</ControlLabel>
										<FormControl
											id="description"
											type="text"
											placeholder="Description"
											value={form.description}
											onChange={this.handlePropChange}/>
									</FormGroup>
								</Col>
							</Row>
							<Row>
								<Col xs={8}>
									<FormGroup>
										<ControlLabel>Small Image</ControlLabel>
										<FormControl
											id="image.small_url"
											type="text"
											placeholder={form.image.small_url}
											value={form.image.small_url}
											onChange={this.handlePropChange}/>
									</FormGroup>
									<FormGroup>
										<ControlLabel>Large Image</ControlLabel>
										<FormControl
											id="image.large_url"
											type="text"
											placeholder={form.image.large_url}
											value={form.image.large_url}
											onChange={this.handlePropChange}/>
									</FormGroup>
								</Col>
								<Col xs={4}>
									<div className="image-upload pack-thumbnail">
										<Thumbnail src={form.image.small_url} />
									</div>
								</Col>
							</Row>
							<Row>
								<Col xs={2} md={2}>
									<FormGroup>
										<ControlLabel>Featured</ControlLabel>
										<FormControl
											id="featured"
											type="checkbox"
											checked={form.featured}
											onChange={this.handlePropChange}/>
									</FormGroup>
								</Col>
							</Row>
							<Row>
								<Col xs={4}>
									<ButtonGroup>
										<Button onClick={this.handleUpdate}>{this.state.isNew ? 'Create' : 'Save'}</Button>
										<Button {...form.published ? {bsStyle: 'primary'} :  {}} onClick={this.togglePublish}>{ form.published ? 'Unpublish' : 'Publish'}</Button>
									</ButtonGroup>
								</Col>
								<Col xs={2}>
									<div className="pull-right">
										<Button onClick={this.onClickAddItem}><Glyphicon glyph="plus-sign" />Add Item</Button>
									</div>
								</Col>
								<Col xs={4}>
									<div className="pull-right">
										<DeleteButton onConfirmation={this.onDelete} />
									</div>
								</Col>
							</Row>
							<Row>
								<div className="media-item-group">
									<h3>Items</h3>
									<div className="items">
										<PaginationControl items={items} />
									</div>
								</div>
							</Row>
						</Col>
						<Col xs={6}>
							<AddItemToPackModal show={this.state.shouldShowSearchPanel} packItems={this.state.model.get('items')} onUpdatePackItems={this.onUpdatePackItems} />
						</Col>
					</Row>
				</Grid>

			</div>
		);
	}
}



