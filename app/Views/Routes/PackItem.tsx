import * as _ from 'underscore';
import * as React from 'react';
import * as ReactRouter from 'react-router';
import { Grid, Row, Col, Thumbnail, Glyphicon, ButtonGroup, Button, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';
var Form = require('react-bootstrap/lib/Form');
var FormGroup = require('react-bootstrap/lib/FormGroup');
var FormControl = require('react-bootstrap/lib/FormControl');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');
var InputGroup = require('react-bootstrap/lib/InputGroup');

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
		this.onUpdatePackItems = this.onUpdatePackItems.bind(this);
		this.onPageSizeChange = this.onPageSizeChange.bind(this);
		pack.on('update', this.updateStateWithPack);
		pack.syncData();
	}

	componentDidMount() {
		this.state.model.fetch({
			success: this.updateStateWithPack
		});
	}

	updateStateWithPack(pack: Pack) {
		let currentPagination = this.state.pagination;

		this.setState({
			model: pack,
			form: pack.toJSON(),
			display: true,
			pagination: _.extend(currentPagination, {
				numPages: this.calculateNumberOfPages(pack.items.length, currentPagination.numItemsPerPage),
				indexRange: this.getIndexRange(currentPagination.activePage, currentPagination.numItemsPerPage)
			})
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

	handlePageClick(e) {
		let currentPagination = this.state.pagination;
		this.setState({
			pagination: _.extend(currentPagination, {
				activePage: e.selected,
				indexRange: this.getIndexRange(e.selected, currentPagination.numItemsPerPage)
			})
		});
	}

	calculateNumberOfPages(numItems: number, numItemsPerPage: number) {
		var pageNum = Math.floor(numItems / numItemsPerPage);
		return (numItems % numItemsPerPage) ? pageNum + 1 : pageNum;
	}

	getIndexRange(pageIndex: number, numItemsPerPage: number) {
		let start = (pageIndex) * numItemsPerPage;
		return {
			start: start,
			end: start + numItemsPerPage - 1
		};
	}

	onPageSizeChange(numItems: number, e: Event) {
		let currentPagination = this.state.pagination;

		this.setState({
			pagination: _.extend(currentPagination, {
				numItemsPerPage: numItems,
				numPages: this.calculateNumberOfPages(this.state.model.items.length, numItems),
				indexRange: this.getIndexRange(currentPagination.activePage, numItems)
			})
		});
	}

	render() {
		let classes = classNames("section pack-item", {hidden: !this.state.display});
		let form = this.state.form;
		let menuItems = perPageDefaults.map((pageDefault) => {
			return (<MenuItem eventKey={pageDefault} key={pageDefault}>{pageDefault}</MenuItem>);
		});

		let numItemsPerPageToggle = (
			<div className="page-size-select">
				<ButtonToolbar>
					<DropdownButton
						title={this.state.pagination.numItemsPerPage}
						id="dropdown-size-medium"
						onSelect={this.onPageSizeChange}
						key="dropdown-size-medium"
						dropup>
						{menuItems}
					</DropdownButton>
				</ButtonToolbar>
			</div>
		);

		console.log('pagination', this.state.pagination);

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
											onChange={this.handlePropChange }/>
									</FormGroup>
									<FormGroup>
										<ControlLabel>Description</ControlLabel>
										<FormControl
											id="description"
											type="text"
											placeholder="Description"
											value={form.description}
											onChange={this.handlePropChange }/>
									</FormGroup>
								</Col>
							</Row>
							<Row>
								<Col xs={9} md={6}>
									<FormGroup>
										<ControlLabel>Price</ControlLabel>
										<InputGroup>
											<InputGroup.Addon>$</InputGroup.Addon>
											<FormControl
												id="price"
												type="number"
												placeholder="Price"
												stop="any"
												min="0"
												addonBefore="$"
												value={this.state.form.price}
												disabled={!form.premium}
												onChange={this.handlePropChange }/>
										</InputGroup>
									</FormGroup>
								</Col>
								<Col xs={2} md={2}>
									<FormGroup>
										<ControlLabel>Premium</ControlLabel>
										<FormControl
											id="premium"
											type="checkbox"
											checked={form.premium}
											onChange={this.handlePropChange }/>
									</FormGroup>
								</Col>
								<Col xs={2} md={2}>
									<FormGroup>
										<ControlLabel>Featured</ControlLabel>
										<FormControl
											id="featured"
											type="checkbox"
											checked={form.featured}
											onChange={this.handlePropChange }/>
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
											onChange={this.handlePropChange }/>
									</FormGroup>
									<FormGroup>
										<ControlLabel>Large Image</ControlLabel>
										<FormControl
											id="image.large_url"
											type="text"
											placeholder={form.image.large_url}
											value={form.image.large_url}
											onChange={this.handlePropChange }/>
									</FormGroup>
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
										<CategoryAssignmentList
											pack={this.state.model}
											indexRange={this.state.pagination.indexRange} />
									</div>
								</div>
							</Row>
						</Col>
						<Col xs={6}>
							<AddItemToPackModal show={this.state.shouldShowSearchPanel} packItems={this.state.model.get('items')} onUpdatePackItems={this.onUpdatePackItems} />
						</Col>
					</Row>
				</Grid>

				<div className="footer fixed">
					<ReactPaginate
						pageNum={this.state.pagination.numPages}
						pageRangeDisplayed={5}
						marginPagesDisplayed={1}
						containerClassName={"pagination"}
						subContainerClassName={"pages pagination"}
						breakLabel={<a href="">...</a>}
						activeClassName={"active"}
						previousLabel={"previous"}
						nextLabel={"next"}
						clickCallback={this.handlePageClick}
					/>
					{numItemsPerPageToggle}
				</div>
			</div>
		);
	}
}



