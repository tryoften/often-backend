import * as React from 'react';
import * as _ from 'underscore';
import {ButtonGroup, Button, MenuItem, DropdownButton } from 'react-bootstrap';
import {IndexablePackItem} from '../../Models/Pack';
import MediaItemView from '../Components/MediaItemView';
import Categories from "../../Collections/Categories";
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
var flow = require('lodash/function/flow');
console.log('here');
//import PropTypes = __React.PropTypes;

interface CategoryAssignmentItemProps extends React.Props<CategoryAssignmentItem> {
	item: IndexablePackItem;
	categories: Categories;
	onClickCategory: Function;
	onClickRemoveItem: Function;
	connectDragSource?: Function;
	connectDropTarget?: Function;
	index: number;
	key: number;
	isDragging?: boolean;
	moveCard: Function;

}

interface CategoryAssignmentItemState extends React.Props<CategoryAssignmentItem> {

}

const style = {
	border: '1px dashed gray',
	padding: '0.5rem 1rem',
	marginBottom: '.5rem',
	backgroundColor: 'white',
	cursor: 'move'
};


const cardSource = {
	beginDrag(props) {
		return {
			id: props.id,
			index: props.index
		};
	}
};

const cardTarget = {
	hover(props, monitor, component) {
		const dragIndex = monitor.getItem().index;
		const hoverIndex = props.index;

		// Don't replace items with themselves
		if (dragIndex === hoverIndex) {
			return;
		}

		// Determine rectangle on screen
		const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

		// Get vertical middle
		const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

		// Determine mouse position
		const clientOffset = monitor.getClientOffset();

		// Get pixels to the top
		const hoverClientY = clientOffset.y - hoverBoundingRect.top;

		// Only perform the move when the mouse has crossed half of the items height
		// When dragging downwards, only move when the cursor is below 50%
		// When dragging upwards, only move when the cursor is above 50%

		// Dragging downwards
		if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
			return;
		}

		// Dragging upwards
		if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
			return;
		}

		// Time to actually perform the action
		props.moveCard(dragIndex, hoverIndex);

		// Note: we're mutating the monitor item here!
		// Generally it's better to avoid mutations,
		// but it's good here for the sake of performance
		// to avoid expensive index searches.
		monitor.getItem().index = hoverIndex;
	}
};

class CategoryAssignmentItem extends React.Component<CategoryAssignmentItemProps, CategoryAssignmentItemState> {

	constructor (props: CategoryAssignmentItemProps) {
		super(props);
	}

	static propTypes = {
		item: React.PropTypes.object.isRequired,
		categories: React.PropTypes.object.isRequired,
		onClickCategory: React.PropTypes.func.isRequired,
		onClickRemoveItem: React.PropTypes.func,
		connectDragSource: React.PropTypes.func,
		connectDropTarget: React.PropTypes.func,
		index: React.PropTypes.number.isRequired,
		isDragging: React.PropTypes.bool.isRequired,
		id: React.PropTypes.any.isRequired,
		moveCard: React.PropTypes.func.isRequired
	}

	render() {
		var categoryMenu = (item) => {
			return this.props.categories.map( category => {
				return <MenuItem
					key={category.id}
					eventKey={category.id}
					onClick={this.props.onClickCategory.bind(this, item._id, category)}>
					{category.name}
				</MenuItem>;
			});
		};


		const opacity = this.props.isDragging ? 0 : 1;
		return this.props.connectDragSource(this.props.connectDropTarget(
			<div key={this.props.item._id} className="clearfix well" style={{style, opacity}}>
				<MediaItemView key={this.props.item._id} item={this.props.item} />
				<div className="media-item-buttons">
					<ButtonGroup>
						<DropdownButton
							bsStyle="default"
							className="category-picker"
							title={ (this.props.item.category) ? this.props.item.category.name : "Unassigned"}
							id={this.props.item._id}
							block>
							{categoryMenu(this.props.item)}
						</DropdownButton>
						<Button onClick={this.props.onClickRemoveItem.bind(this, this.props.item)}>Remove</Button>
					</ButtonGroup>
				</div>
			</div>
		)
		);
	}
}

export default flow(
	DragSource('categoryitem', cardSource, (connect, monitor) => ({
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging()
	})),
	DropTarget('categoryitem', cardTarget, connect => ({
		connectDropTarget: connect.dropTarget()
	}))
)(CategoryAssignmentItem);

