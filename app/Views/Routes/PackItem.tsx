import * as React from 'react';
import * as ReactRouter from 'react-router';
import { Grid, Row, Col, Input, Thumbnail, Glyphicon, ButtonGroup, Button, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';
import Pack, {PackAttributes, IndexablePackItem} from '../../Models/Pack';
import AddItemToPackModal from '../Components/AddItemToPackModal';
import * as classNames from 'classnames';
import * as objectPath from 'object-path';
import DeleteButton from '../Components/DeleteButton';
import CategoryAssignmentList from '../Components/CategoryAssignmentList';
var ReactPaginate = require('react-paginate');
interface PackItemProps extends React.Props<PackItem> {
	params: {
		packId: string;
	};
}

interface Pagination {
	numItemsPerPage?: number;
	numPages?: number;
	activePage?: number;
	indexRange?: IndexRange;
	perPageDefaults?: LabelValuePair[];
}

export interface IndexRange {
	start: number;
	end: number;
}


interface PackItemState extends React.Props<PackItem> {
	model?: Pack;
	shouldShowSearchPanel?: boolean;
	display?: boolean;
	isNew?: boolean;
	form?: PackAttributes;
	pagination?: Pagination;
}

interface LabelValuePair {
	label: string;
	value: number;
}

const perPageDefaults = [10, 50, 100, 1000];

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
			isNew: isNew,
			pagination: {
				numItemsPerPage: 10,
				numPages: 1,
				activePage: 0,
				indexRange: {
					start: 0,
					end: -1
				}
			}
		};

		this.updateStateWithPack = this.updateStateWithPack.bind(this);
		this.handlePropChange = this.handlePropChange.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
		this.onClickAddItem = this.onClickAddItem.bind(this);
		this.togglePublish = this.togglePublish.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.calculateNumberOfPages = this.calculateNumberOfPages.bind(this);
		this.getIndexRange = this.getIndexRange.bind(this);
		this.handlePageClick = this.handlePageClick.bind(this);
		this.getIndexRange = this.getIndexRange.bind(this);
		this.onDropDownSelect = this.onDropDownSelect.bind(this);


		pack.on('update', this.updateStateWithPack);
		pack.syncData();
	}

	componentDidMount() {
		this.state.model.fetch({
			success: this.updateStateWithPack
		});
	}

	calculateNumberOfPages(numItems: number, numItemsPerPage: number) {
		var pageNum = Math.floor(numItems / numItemsPerPage);
		return (numItems % numItemsPerPage) ? pageNum + 1 : pageNum;
	}

	updateStateWithPack(pack: Pack) {

		let currentPagination = this.state.pagination;

		this.setState({
			model: pack,
			form: pack.toJSON(),
			display: true,
			pagination: {
				numItemsPerPage: currentPagination.numItemsPerPage,
				numPages: this.calculateNumberOfPages(pack.items.length, currentPagination.numItemsPerPage),
				activePage: currentPagination.activePage,
				indexRange: this.getIndexRange(currentPagination.activePage, currentPagination.numItemsPerPage)
			}
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
		let form = this.state.form;

		var diff = model.featured !== form.featured;
		model.save(this.state.form);
		/* Check if there's a discrepancy between featured flag on model and form */
		if (diff) {
			model.updateFeatured();
		}
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

	getIndexRange(pageIndex: number, numItemsPerPage: number) {
		let start = (pageIndex) * numItemsPerPage;
		return {
			start: start,
			end: start + numItemsPerPage - 1
		};
	}
	handlePageClick(e) {
		let currentPagination = this.state.pagination;
		this.setState({
			pagination: {
				numItemsPerPage: currentPagination.numItemsPerPage,
				numPages: currentPagination.numPages,
				activePage: e.selected,
				indexRange: this.getIndexRange(e.selected, currentPagination.numItemsPerPage)
			}
		});
	}

	onDropDownSelect(e: Event, eventKey: number) {
		let currentPagination = this.state.pagination;
		this.setState({
			pagination: {
				numItemsPerPage: eventKey,
				numPages: this.calculateNumberOfPages(this.state.model.items.length, eventKey),
				activePage: currentPagination.activePage,
				indexRange: this.getIndexRange(currentPagination.activePage, eventKey)
			}
		});
	}

	render() {

		let classes = classNames("section pack-item", {hidden: !this.state.display});
		let form = this.state.form;
		let menuItems = perPageDefaults.map((pageDefault) => {
			return (<MenuItem eventKey={pageDefault} key={pageDefault}>{pageDefault}</MenuItem>);
		});

		let numItemsPerPageToggle = (
			<div>
				Results Per Page:
				<ButtonToolbar>
					<DropdownButton
						title={this.state.pagination.numItemsPerPage}
						id="dropdown-size-medium"
						onSelect={this.onDropDownSelect}
					>
						{menuItems}
					</DropdownButton>
				</ButtonToolbar>
			</div>
		);

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
									<ReactPaginate
										pageNum={this.state.pagination.numPages}
										pageRangeDisplayed={5}
										marginPagesDisplayed={1}
										containerClassName={"pagination"}
										subContainerClassName={"pages pagination"}
										activeClassName={"active"}
										previousLabel={"previous"}
										nextLabel={"next"}
										clickCallback={this.handlePageClick}
									/>
									{numItemsPerPageToggle}
									<div className="items">
										<CategoryAssignmentList
											pack={this.state.model}
											indexRange={this.state.pagination.indexRange}
										/>
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



