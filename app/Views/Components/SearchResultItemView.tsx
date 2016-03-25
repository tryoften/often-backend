import * as React from 'react';
import {IndexableObject} from "../../Interfaces/Indexable";
import MediaItemType from "../../Models/MediaItemType";

interface SearchResultItemViewProps {
	item: IndexableObject;
}

export default class SearchResultItemView extends React.Component<SearchResultItemViewProps, {}> {
	render() {
		switch (this.props.item._type) {
			case MediaItemType.lyric:
				return (<div className="item lyric">
					{this.props.item.text}
				</div>);
			case MediaItemType.track:
				return (<div className="item track">
					{this.props.item.title} by {this.props.item.author}
				</div>);
			case MediaItemType.artist:
				return (<div className="item artist">
					{this.props.item.name}
				</div>);
		}
	}
}
