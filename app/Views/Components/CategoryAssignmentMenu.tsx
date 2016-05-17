import * as React from 'react';
import Category from '../../Models/Category';
import { MenuItem } from 'react-bootstrap';

interface CategoryAssignmentMenuProps extends React.Props<CategoryAssignmentMenu> {
	categories: Category[];
	onClickCategory: Function;
}

export default class CategoryAssignmentMenu extends React.Component<CategoryAssignmentMenuProps, {}> {
	constructor(props: CategoryAssignmentMenuProps) {
		super(props);
	}

	onClickCategory(category: Category, e: Event) {

	}

	render() {
		let items = this.props.categories.map( category => {
			return <MenuItem
				key={category.id}
				eventKey={category.id}
				onClick={this.props.onClickCategory.bind(this, category)}>
				{category.name}
			</MenuItem>;
		});

		return (
			<div>{items}</div>
		);
	}
}
