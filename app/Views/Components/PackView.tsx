import * as React from 'react';
import MediaItem from "../../Models/MediaItem";
import Pack from "../../Models/Pack";

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
					<image className="image" src="http://placehold.it/200x200" />
					<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
						 className="mask" width="135px" height="21px" viewBox="0 0 135 21">
						<g id="Artboard-1" transform="translate(-87.000000, -224.000000)" fill="#FFFFFF">
							<path d="M222,224.283203 L222,245 L87,245 L222,224.283203 Z" id="mask"></path>
						</g>
					</svg>
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
