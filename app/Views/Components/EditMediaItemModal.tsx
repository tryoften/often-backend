import * as React from 'react';
import * as _ from 'underscore';
import { Modal, Button} from 'react-bootstrap';
import MediaItemView from '../Components/MediaItemView';
import {IndexablePackItem} from '../../Models/Pack';
import CategoryAssignmentMenu from '../Components/CategoryAssignmentMenu';
import Categories from '../../Collections/Categories';
import Category from '../../Models/Category';

interface EditMediaItemModalProps {
	show?: boolean;
	item?: IndexablePackItem;
	removeItemFromPack?: (item: IndexablePackItem) => void;
	categories?: Categories;
	onClickCategory?: (itemId: string, category: Category, e: Event) => void;
}

interface EditMediaItemModalState {
	showModal?: boolean;
}

export default class EditMediaItemModal extends React.Component<EditMediaItemModalProps, EditMediaItemModalState> {

	constructor(props: any) {
		super(props);

		this.state = {
			showModal: props.show
		};
		this.close = this.close.bind(this);
		this.onClickRemove = this.onClickRemove.bind(this);
	}

	close() {
		this.setState({
			showModal: false
		});
	}

	componentWillReceiveProps(nextProps: EditMediaItemModalProps) {
		this.setState({
			showModal: nextProps.show
		});
	}

	onClickRemove() {
		this.props.removeItemFromPack(this.props.item);
		this.setState({
			showModal: false
		});
	}

	render() {

		let showItem = () => {
			if (this.props.item) {
				return <MediaItemView item={this.props.item} />;
			} else {
				return <div>Item not selected</div>;
			}
		};

		return (
			<Modal show={this.state.showModal} onHide={this.close} bsSize="large">
				<Modal.Header>
					Edit Item
				</Modal.Header>
				<Modal.Body>
					{showItem()}
					<CategoryAssignmentMenu
						bsStyle="default"
						className="category-picker"
						categories={this.props.categories}
						onClickCategory={this.props.onClickCategory}
						context={this}
						title={ (this.props.item && this.props.item.category) ? this.props.item.category.name : "Unassigned"}
						id={ (this.props.item) ?  this.props.item._id : 'unassigned'}
						block>
					</CategoryAssignmentMenu>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.onClickRemove}>Remove</Button>
					<Button onClick={this.close}>Cancel</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
