import * as React from 'react';
import * as ReactRouter from 'react-router';
import { Grid, Row, Col, Input, Thumbnail, Glyphicon, ButtonGroup, Button } from 'react-bootstrap';
import Pack, {PackAttributes, IndexablePackItem} from '../../Models/Pack';
import AddItemToPackModal from '../Components/AddItemToPackModal';
import * as classNames from 'classnames';
import * as objectPath from 'object-path';
import DeleteButton from '../Components/DeleteButton';
import CategoryAssignmentList from '../Components/CategoryAssignmentList';

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

		this.state = {
			model: pack,
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

		pack.on('update', this.updateStateWithPack);
		pack.syncData();
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

	onClickRemoveItem(item: IndexablePackItem, e: Event) {
		console.log(item);

		let pack = this.state.model;
		pack.removeItem(item);

		this.setState({
			model: pack,
			form: pack.toJSON()
		});
	}

	onSelectItem(item: IndexablePackItem) {
		let items: IndexablePackItem[] = this.state.model.get('items');
		items.push(item);

		this.state.model.save({items, items_count: items.length});

		this.setState({
			model: this.state.model,
			form: this.state.model.toJSON(),
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
		model.save(this.state.form);
		this.setState({model: model, isNew: false});

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
									<Input
										id="name"
										type="text"
										label="Name"
										bsSize="medium"
										placeholder="Enter Name"
										value={form.name}
										onChange={this.handlePropChange}
									/>
									<Input
										id="description"
										type="textarea"
										label="Description"
										placeholder="Description"
										value={form.description}
										onChange={this.handlePropChange}
									/>

								</Col>
							</Row>
							<Row>
								<Col xs={9} md={6}>
									<Input
										id="price"
										type="number"
										step="any"
										min="0"
										label="Price"
										addonBefore="$"
										value={this.state.form.price}
										onChange={this.handlePropChange}
										disabled={!form.premium}
									/>
								</Col>
								<Col xs={2} md={2}>
									<Input
										id="premium"
										type="checkbox"
										bsSize="large"
										label="Premium"
										checked={form.premium}
										onChange={this.handlePropChange}
									/>
								</Col>
								<Col xs={2} md={2}>
									<Input
										id="featured"
										type="checkbox"
										bsSize="large"
										label="Featured"
										checked={this.state.form.featured}
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
										placeholder={form.image.small_url}
										value={form.image.small_url}
										onChange={this.handlePropChange}
									/>
									<Input
										id="image.large_url"
										type="text"
										label="Large Image"
										bsSize="medium"
										placeholder={form.image.large_url}
										value={form.image.large_url}
										onChange={this.handlePropChange}
									/>
								</Col>
								<Col xs={4}>
									<div class="image-upload pack-thumbnail">
										<Thumbnail src={form.image.small_url} />
									</div>
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
										<CategoryAssignmentList pack={this.state.model}/>
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
				</Grid>
			</div>
		);
	}
}



