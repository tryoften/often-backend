import * as React from 'react';
import Owner from "../../Models/Owner";
import ImageBrandMask from '../Components/ImageBrandMask';

export interface OwnerViewProps extends React.Props<OwnerView> {
	model: Owner;
	onItemSelected?: (owner: Owner) => void;
}

export default class OwnerView extends React.Component<OwnerViewProps, {}> {
	onClickEvent(e: Event) {
		if (this.props.onItemSelected) {
			this.props.onItemSelected(this.props.model);
		}
	}

	render() {
		return (
			<div className="owner media-item" id={this.props.model.id} onClick={this.onClickEvent.bind(this)}>
				<div className="image-container" style={{backgroundImage: `url(${this.props.model.get('image').small_url})`}}>
					<ImageBrandMask />
				</div>
				<div className="meta">
					<div className="title">{this.props.model.get('name')}</div>
					<div className="subtitle">{this.props.model.quotes_count || 0} items</div>
					<div className="description">{this.props.model.get('description')}</div>
				</div>
			</div>
		);
	}
}
