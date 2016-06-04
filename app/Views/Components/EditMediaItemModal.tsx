import * as React from 'react';
import * as _ from 'underscore';
import { Modal, Button, Alert, Grid, Row, Col} from 'react-bootstrap';
import MediaItemView from '../Components/MediaItemView';
import {IndexablePackItem} from '../../Models/Pack';
import CategoryAssignmentMenu from '../Components/CategoryAssignmentMenu';
import Categories from '../../Collections/Categories';
import Category from '../../Models/Category';
import DeleteButton from '../Components/DeleteButton';
const FormGroup = require('react-bootstrap/lib/FormGroup');
const FormControl = require('react-bootstrap/lib/FormControl');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');

interface EditMediaItemModalProps {
	show?: boolean;
	item?: IndexablePackItem;
	numItems: number;
	selectedItemPosition?: number;
	removeItemFromPack?: (item: IndexablePackItem) => void;
	categories?: Categories;
	onSetItemCategory: (itemId: string, category: Category) => void;
	onSetItemPosition: (itemId: string, newPosition: number) => void;
	onCloseMediaItemModal?: () => void;
}

interface EditMediaItemModalState {
	showModal?: boolean;
	selectedCategory?: any;
	categoryChanged?: boolean;
	currentPlacement?: number;
	placementChanged?: boolean;
	acknowledgement?: string;
}

export default class EditMediaItemModal extends React.Component<EditMediaItemModalProps, EditMediaItemModalState> {

	constructor(props: any) {
		super(props);

		this.state = {
			showModal: props.show,
			selectedCategory: null,
			categoryChanged: false,
			placementChanged: false,
			acknowledgement: ''
		};
		this.cancel = this.cancel.bind(this);
		this.save = this.save.bind(this);
		this.onSelectCategory = this.onSelectCategory.bind(this);
		this.onSelectPosition = this.onSelectPosition.bind(this);
		this.onClickRemove = this.onClickRemove.bind(this);
	}

	componentWillReceiveProps(nextProps: EditMediaItemModalProps) {
		//TODO(jakub): use CategoryAttributes type throughout as opposed to Category model
		this.setState({
			selectedCategory: (nextProps.item) ? (nextProps.item.category) : null,
			showModal: nextProps.show
		});
	}

	cancel() {
		this.props.onCloseMediaItemModal();
		this.setState({
			showModal: false,
			categoryChanged: false,
			placementChanged: false,
			selectedCategory: null,
			acknowledgement: ''
		});
	}

	save() {

		if (this.state.categoryChanged) {
			this.props.onSetItemCategory(this.props.item.id, this.state.selectedCategory);
		}

		if (this.state.placementChanged) {
			this.props.onSetItemPosition(this.props.item.id, this.state.currentPlacement);
		}

		this.setState({
			acknowledgement: "Successfully saved changes!",
			categoryChanged: false,
			placementChanged: false
		});
	}

	onClickRemove() {
		this.props.removeItemFromPack(this.props.item);
		this.setState({
			showModal: false
		});
	}

	onSelectCategory(category: Category) {
		if (!this.state.selectedCategory || (category.id !== this.state.selectedCategory.id)) {
			this.setState({
				selectedCategory: category,
				categoryChanged: true
			});
		}
	}

	onSelectPosition(e: any) {
		let newPosition = e.target.value;
		this.setState({
			currentPlacement: newPosition,
			placementChanged: true
		});
	}

	render() {

		if (!this.props.item) {
			return null;
		}

		let showItem = () => {
			if (this.props.item) {
				return <MediaItemView item={this.props.item} />;
			} else {
				return <div>Item not selected</div>;
			}
		};

		let selectorOptions = _.range(0, this.props.numItems).map((i) => {
			return (<option value={i} key={i}>{i + 1}</option>);
		});
		let positionSelector = (
			<FormGroup controlId="selectPlacement">
				<ControlLabel>Placement</ControlLabel>
				<FormControl componentClass="select" placeholder="select" onChange={this.onSelectPosition} defaultValue={this.props.selectedItemPosition}>
					{selectorOptions}
				</FormControl>
			</FormGroup>
		);

		let categoryAssignmentMenu = (
			<FormGroup controlId="selectCategoryControl">
				<ControlLabel>Select Category</ControlLabel>
				<CategoryAssignmentMenu
					bsStyle="default"
					className="category-picker"
					categories={this.props.categories}
					onClickCategory={this.onSelectCategory}
					context={this}
					title={ (this.state.selectedCategory) ? this.state.selectedCategory.name : "Ex: Type, Celebration, Yes, Happy"}
					id={ this.props.item._id}
					block>
				</CategoryAssignmentMenu>
			</FormGroup>
		);

		let displayAcknowledgement = () => {
			if (this.state.acknowledgement) {
				return <Alert bsSize="small" bsStyle="success">{this.state.acknowledgement}</Alert>;
			}
		};

		let modalFooter = (
			<Modal.Footer className="modal-footer">
				<Grid fluid>
					<Row>
						<Col md={1}>
							<Button onClick={this.cancel}>Cancel</Button>
						</Col>
						<Col md={1} mdOffset={7}>
							<DeleteButton bsStyle="default" onConfirmation={this.onClickRemove} text="Remove"/>
						</Col>
						<Col md={1} mdOffset={1} className="column-right-tilt">
							<Button className="save-button" onClick={this.save} disabled={!(this.state.categoryChanged || this.state.placementChanged)}>Save</Button>
						</Col>
					</Row>
				</Grid>
			</Modal.Footer>
		);

		return (

			<div className="modal-container">
				<Modal show={this.state.showModal} onHide={this.cancel} className="modal-panel">
					<Modal.Header className="modal-header">
						<h2>Edit Item</h2>
					</Modal.Header>
					<Modal.Body className="modal-body">
						<div className="media-item-content">
							{showItem()}
						</div>
						{categoryAssignmentMenu}
						{positionSelector}
						{displayAcknowledgement()}
					</Modal.Body>
					{modalFooter}
				</Modal>
			</div>
		);
	}
}

