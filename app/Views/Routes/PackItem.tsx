import * as React from 'react';
import { Grid, Row, Col, Input, Thumbnail, Glyphicon, ButtonInput, MenuItem, DropdownButton } from 'react-bootstrap';
import Pack, {PackAttributes} from '../../Models/Pack';
import MediaItemView from '../Components/MediaItemView';
import AddItemToPackModal from '../Components/AddItemToPackModal';
import * as classNames from 'classnames';
import * as objectPath from 'object-path';
import { IndexableObject } from "../../Interfaces/Indexable";
import Categories from '../../Collections/Categories';
import Category from '../../Models/Category';

interface PackItemProps extends React.Props<PackItem> {
	params: {
		packId: string;
	};
}

interface PackItemState extends React.Props<PackItem> {
	model?: Pack;
	shouldShowSearchPanel?: boolean;
	categories?: any;
	display?: boolean;
	isNew?: boolean;
	form?: PackAttributes;
}

export default class PackItem extends React.Component<PackItemProps, PackItemState> {
	constructor(props: PackItemProps) {
		super(props);

		let isNew = !props.params.packId;
		let pack = isNew ? new Pack() : new Pack({
			id: props.params.packId
		});

		var categories = new Categories();

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
		pack.on('update', this.updateStateWithPack);
	}

	componentDidMount() {
		this.state.model.fetch({
			success: this.updateStateWithPack
		});
	}

	updateStateWithPack(pack: Pack) {
		this.setState({
			model: pack,
			form: pack.toJSON(),
			display: true
		});

		//this.onSelectCategory = this.onSelectCategory.bind(this);
	}

	componentWillReceiveProps() {
		console.log('componentWillReceiveProps');
	}

	onClickAddItem(e: Event) {
		e.preventDefault();

		this.setState({
			shouldShowSearchPanel: true
		});
	}

	onClickCategory(itemId: string, category: Category) {
		var model = this.state.model;
		model.assignCategoryToItem(itemId, category);

		this.setState({model: model});
	}

	onSelectItem(item: IndexableObject) {
		let items = this.state.model.get('items');
		items.push(item);

		this.state.model.save({items});

		this.setState({
			model: this.state.model,
			form: this.state.model.toJSON(),
			shouldShowSearchPanel: false
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

		var categoryMenu = (item) => {
			return this.state.categories.map(category => {
				return <MenuItem eventKey={category.id} onClick={this.onClickCategory.bind(this, item._id, category)}>{category.name}</MenuItem>
			});
		};



		var itemsComponents = this.state.model.items.map((item: any) => {
			return (
				<Row>
					<MediaItemView key={item._id} item={item} />
					<DropdownButton
						bsStyle="default"
						title={item.category_name || "Unassigned"}
						id={item._id}
					>
						{categoryMenu(item)}
					</DropdownButton>
				</Row>
			);

		});

		let classes = classNames("section pack-item", {hidden: !this.state.display});

		return (
			<div className={classes}>
				<header className="section-header">
					<h2>{this.state.model.name}</h2>
				</header>

				<Grid fluid={true}>
					<form className="packForm" onSubmit={this.handleUpdate}>
						<Row>
							<Col xs={6}>
								<Row>
									<Col xs={8}>
										<Input
											id="name"
											type="text"
											label="Name"
											bsSize="medium"
											placeholder="Enter Name"
											value={this.state.form.name}
											onChange={this.handlePropChange}
										/>
										<Input
											id="description"
											type="textarea"
											label="Description"
											placeholder="Description"
											value={this.state.form.description}
											onChange={this.handlePropChange}
										/>
									</Col>
								</Row>
								<Row>
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
									<Col xs={4}>
										<div class="image-upload">
											<Thumbnail src={this.state.form.image.small_url} />
										</div>
									</Col>
								</Row>
								<Row>
									<div className="media-item-group">
										<h3>Items</h3>
										<div className="items">
											{itemsComponents}
											<div className="add-item pull-left" onClick={this.onClickAddItem}>
												<span className="text"><Glyphicon glyph="plus-sign" /> Add Item</span>
											</div>
										</div>
									</div>
								</Row>
							</Col>
							<Col xs={6}>
								<AddItemToPackModal show={this.state.shouldShowSearchPanel} onSelectItem={this.onSelectItem.bind(this)} />
							</Col>
						</Row>
						<Row>
							<Col xs={8}>
								<ButtonInput type="submit" value={this.state.isNew ? 'Create' : 'Save'} />
							</Col>
						</Row>
					</form>
				</Grid>
			</div>
		);
	}
}
