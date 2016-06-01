import * as React from 'react';
import * as _ from 'underscore';
import { Modal, Button} from 'react-bootstrap';
import MediaItemView from '../Components/MediaItemView';
import {IndexablePackItem} from '../../Models/Pack';
import CategoryAssignmentMenu from '../Components/CategoryAssignmentMenu';
import Categories from '../../Collections/Categories';
import Category from '../../Models/Category';
const FormGroup = require('react-bootstrap/lib/FormGroup');
const FormControl = require('react-bootstrap/lib/FormControl');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');

interface EditMediaItemModalProps {
	show?: boolean;
	item?: IndexablePackItem;
	numItems: number;
	removeItemFromPack?: (item: IndexablePackItem) => void;
	categories?: Categories;
	onSetItemCategory: (itemId: string, category: Category) => void;
	onSetItemPosition: (itemId: string, newPosition: number) => void;
}

interface EditMediaItemModalState {
	showModal?: boolean;
	selectedCategory?: any;
	categoryChanged?: boolean;
	currentPlacement?: number;
	placementChanged?: boolean;
}

export default class EditMediaItemModal extends React.Component<EditMediaItemModalProps, EditMediaItemModalState> {

	constructor(props: any) {
		super(props);

		this.state = {
			showModal: props.show,
			selectedCategory: null,
			categoryChanged: false,
			currentPlacement: props.placement,
			placementChanged: false
		};
		this.cancel = this.cancel.bind(this);
		this.save = this.save.bind(this);
		this.onSelectCategory = this.onSelectCategory.bind(this);
		this.onSelectPosition = this.onSelectPosition.bind(this);
		this.onClickRemove = this.onClickRemove.bind(this);
	}

	componentWillReceiveProps(nextProps: EditMediaItemModalProps) {
		this.setState({
			//TODO(jakub): use CategoryAttributes type throughout as opposed to Category
			selectedCategory: nextProps.item.category,
			showModal: nextProps.show
		});
	}

	cancel() {
		this.setState({
			showModal: false,
			categoryChanged: false,
			selectedCategory: null
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
		//TODO(jakub): Explore the use of on change event
		if (!this.state.selectedCategory || (category.id !== this.state.selectedCategory.id)){
			this.setState({
				selectedCategory: category,
				categoryChanged: true
			});
		}
	}

	onSelectPosition(e: any) {
		let newPosition = e.target.value;
		console.log('position', newPosition);
		this.setState({
			currentPlacement: newPosition,
			placementChanged: true
		});
	}

	render() {

		if (!this.props.item) {
			return <div>Modal not loaded with proper media item</div>;
		}

		let showItem = () => {
			if (this.props.item) {
				return <MediaItemView item={this.props.item} />;
			} else {
				return <div>Item not selected</div>;
			}
		};

		let selectorOptions = _.range(0, this.props.numItems).map((i) => { return (<option value={i}>{i+1}</option>); })
		let positionSelector = (
			<FormGroup controlId="formControlsSelect">
				<ControlLabel>Select Placement</ControlLabel>
				<FormControl componentClass="select" placeholder="select" onChange={this.onSelectPosition}>
					{selectorOptions}
				</FormControl>
			</FormGroup>
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
						{positionSelector}
					</Modal.Body>
					<Modal.Footer className="modal-footer">
						<Button onClick={this.cancel}>Cancel</Button>
						<Button onClick={this.onClickRemove}>Remove</Button>
						<Button onClick={this.save} disabled={!(this.state.categoryChanged || this.state.placementChanged)}>Save</Button>
					</Modal.Footer>
				</Modal>
			</div>
		);
	}
}

