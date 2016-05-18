import * as React from 'react';
import * as _ from 'underscore';
import { ButtonGroup, Button, DropdownButton } from 'react-bootstrap';
import { IndexablePackItem } from '../../Models/Pack';
import MediaItemView from '../Components/MediaItemView';
import Categories from "../../Collections/Categories";

interface CategoryAssignmentItemProps extends React.Props<CategoryAssignmentItem> {
	item: IndexablePackItem;
	categories: Categories;
	onClickCategory: Function;
	onClickRemoveItem: Function;
	index: number;
	key: number;
	categoryMenu: React.ReactNode;
}

interface CategoryAssignmentItemState extends React.Props<CategoryAssignmentItem> {

}

class CategoryAssignmentItem extends React.Component<CategoryAssignmentItemProps, CategoryAssignmentItemState> {
	constructor (props: CategoryAssignmentItemProps) {
		super(props);
	}

	render() {
		return (
			<div key={this.props.item._id} className="clearfix well pack-item">
				<div className="index-display">{this.props.index + 1}</div>
				<MediaItemView key={this.props.item._id} item={this.props.item} />
				<div className="media-item-buttons">
					<ButtonGroup>
						<DropdownButton
							bsStyle="default"
							className="category-picker"
							title={ (this.props.item.category) ? this.props.item.category.name : "Unassigned"}
							id={this.props.item._id}
							block>
							{this.props.categoryMenu}
						</DropdownButton>
						<Button onClick={this.props.onClickRemoveItem.bind(this, this.props.item)}>Remove</Button>
					</ButtonGroup>
				</div>
			</div>
		);
	}
}

export default CategoryAssignmentItem;
