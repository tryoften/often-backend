import * as React from 'react';
import * as _ from 'underscore';
import Pack, {IndexablePackItem} from '../../Models/Pack';
import Categories from '../../Collections/Categories';
import Category from '../../Models/Category';
import CategoryAssignmentItem from '../Components/CategoryAssignmentItem';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';


interface CategoryAssignmentProps extends React.Props<CategoryAssignmentList> {
	pack: Pack;
}

interface CategoryAssignmentState extends React.Props<CategoryAssignmentList> {
	categories?: Categories;
	pack?: Pack;
}

const style = {
	width: 400
};

class CategoryAssignmentList extends React.Component<CategoryAssignmentProps, CategoryAssignmentState> {

	constructor (props: CategoryAssignmentProps) {
		super(props);

		var categories = new Categories();

		this.state = {
			pack: props.pack,
			categories: categories
		};

		_.bindAll(this, 'updateStateWithCategories', 'onClickCategory', 'onClickRemoveItem', 'moveCard');
		categories.on('update', this.updateStateWithCategories);
	}

	updateStateWithCategories(categories: Categories) {
		this.setState({categories});
	}

	onClickCategory(itemId: string, category: Category, e: Event) {
		e.preventDefault();

		var model = this.state.pack;
		model.assignCategoryToItem(itemId, category);

		this.setState({pack: model});
	}

	onClickRemoveItem(item: IndexablePackItem, e: Event) {
		console.log(item);

		let pack = this.state.pack;
		pack.removeItem(item);

		this.setState({
			pack: pack
		});
	}

	moveCard(dragIndex, hoverIndex) {
		var pack = this.state.pack;
		const items  = this.state.pack.items;

		const dragCard = items[dragIndex];
		items.splice(dragIndex, 1);
		items.splice(hoverIndex, 0, dragCard);
		pack.save({items : items});
		this.setState({
			pack: pack
		});


	}

	render () {

		return (
			<div style={style}>
				{this.props.pack.items.map((item: IndexablePackItem, i) => {
					return (
						<CategoryAssignmentItem
							item={item}
							id = {item.id}
							categories={this.state.categories}
							onClickCategory={this.onClickCategory}
							onClickRemoveItem={this.onClickRemoveItem}
							moveCard={this.moveCard}
							index={i}
							key={i}
						/>

					);
				})}
			</div>
		);
	}

}
export default DragDropContext(HTML5Backend)(CategoryAssignmentList);
