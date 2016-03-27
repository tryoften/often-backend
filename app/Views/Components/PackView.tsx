import * as React from 'react';
import MediaItem from "../../Models/MediaItem";

export interface PackViewProps extends React.Props<PackView> {
	model: MediaItem;
}

export default class PackView extends React.Component<PackViewProps, {}> {
	render() {
		return (
			<div class="pack media-item">

			</div>
		)
	}
}
