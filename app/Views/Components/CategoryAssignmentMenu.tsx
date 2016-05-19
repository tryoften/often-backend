import * as React from 'react';
import { MenuItem, DropdownButton, DropdownButtonProps } from 'react-bootstrap';
import Categories from '../../Collections/Categories';
import {} from "react-bootstrap";

interface CategoryAssignmentMenuProps extends React.Props<CategoryAssignmentMenu>, DropdownButtonProps {
	categories: Categories;
	onClickCategory: Function;
	context: any;
}

export default class CategoryAssignmentMenu extends React.Component<CategoryAssignmentMenuProps, {}> {
	constructor(props: CategoryAssignmentMenuProps) {
		super(props);
	}

	render() {
		let items = this.props.categories.sortBy('name').map( category => {
			return <MenuItem
				key={category.id}
				eventKey={category.id}
				onClick={this.props.onClickCategory.bind(this.props.context, category)}>
				{category.name}
			</MenuItem>;
		});

		return (
			<DropdownButton {...this.props}>{items}</DropdownButton>
		);
	}
}
