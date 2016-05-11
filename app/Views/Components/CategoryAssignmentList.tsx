import * as React from 'react';
import * as _ from 'underscore';
import Pack, {IndexablePackItem} from '../../Models/Pack';
import Categories from '../../Collections/Categories';
import Category from '../../Models/Category';
import CategoryAssignmentItem from '../Components/CategoryAssignmentItem';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { IndexRange } from '../Routes/PackItem';

interface CategoryAssignmentProps extends React.Props<CategoryAssignmentList> {
	pack: Pack;
	indexRange?: IndexRange;
}

interface CategoryAssignmentState extends React.Props<CategoryAssignmentList> {
	categories?: Categories;
	pack?: Pack;
}

class CategoryAssignmentList extends React.Component<CategoryAssignmentProps, CategoryAssignmentState> {

	constructor (props: CategoryAssignmentProps) {
		super(props);

		var categories = new Categories();

		this.state = {
			categories: categories,
			pack: props.pack
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
		var currentIndex = (this.props.indexRange) ? this.props.indexRange.start : 0;
		var endIndex = (this.props.indexRange) ? Math.min(this.props.indexRange.end, this.props.pack.items.length - 1) : this.props.pack.items.length - 1;
		let components = [];
		for (; currentIndex <= endIndex; currentIndex++) {
			let item = this.props.pack.items[currentIndex];
			components.push(
				<CategoryAssignmentItem
					item={item}
					id={item.id}
					categories={this.state.categories}
					onClickCategory={this.onClickCategory}
					onClickRemoveItem={this.onClickRemoveItem}
					moveCard={this.moveCard}
					index={currentIndex}
					key={currentIndex}
				/>
			);
		}

		return (
			<div>
				{components}
			</div>
		);
	}

}

export default DragDropContext<CategoryAssignmentProps>(HTML5Backend)(CategoryAssignmentList);
