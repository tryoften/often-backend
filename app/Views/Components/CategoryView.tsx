import * as React from 'react';
import MediaItem from "../../Models/MediaItem";
import Category from "../../Models/Category";
import ImageBrandMask from '../Components/ImageBrandMask';

export interface CategoryViewProps extends React.Props<CategoryView> {
	model: Category;
	onItemSelected?: (category: Category) => void;
}

export default class CategoryView extends React.Component<CategoryViewProps, {}> {
	onClickEvent(e: Event) {
		if (this.props.onItemSelected) {
			this.props.onItemSelected(this.props.model);
		}
	}

	render() {

		return (
			<div className="category" id={this.props.model.id} onClick={this.onClickEvent.bind(this)}>
				<div className="title">{this.props.model.id}</div>
				<div className="image-container" style={{backgroundImage: `url(${this.props.model.get("image")})`}}></div>

			</div>
		);
	}
}
