import * as React from 'react';
import MediaItem from "../../Models/MediaItem";
import Pack from "../../Models/Pack";
import ImageBrandMask from '../Components/ImageBrandMask';

export interface PackViewProps extends React.Props<PackView> {
	model: Pack;
	onItemSelected?: (pack: Pack) => void;
}

export default class PackView extends React.Component<PackViewProps, {}> {
	onClickEvent(e: Event) {
		if (this.props.onItemSelected) {
			this.props.onItemSelected(this.props.model);
		}
	}

	render() {
		return (
			<div className="pack media-item" id={this.props.model.id} onClick={this.onClickEvent.bind(this)}>
				<div className="image-container">
					<image className="image" src={this.props.model.get('image_url')} />
					<ImageBrandMask />
				</div>
				<div className="meta">
					<div className="title">{this.props.model.name}</div>
					<div className="subtitle">12 items</div>
					<div className="description">{this.props.model.get('description')}</div>
				</div>
			</div>
		)
	}
}
