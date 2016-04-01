import * as React from 'react';
import * as classNames from 'classnames';
import { IndexableObject } from "../../Interfaces/Indexable";
import { TrackIndexableObject } from "../../Models/Track";
import { ArtistIndexableObject } from "../../Models/Artist";
import MediaItemType from "../../Models/MediaItemType";
import ImageBrandMask from '../Components/ImageBrandMask';

interface SearchResultItemViewProps {
	item: IndexableObject;
	onSelect?: (item: IndexableObject) => void;
}

export default class MediaItemView extends React.Component<SearchResultItemViewProps, {}> {
	onSelect() {
		if (this.props.onSelect) {
			this.props.onSelect(this.props.item);
		}
	}

	render() {
		let classes = classNames("media-item pull-left", this.props.item._type);
		switch (this.props.item._type) {
			case MediaItemType.quote:
			case MediaItemType.lyric:
				return (
					<div className={classes} onClick={this.onSelect.bind(this)}>
						<div className="content">
							{this.props.item.text}
						</div>
					</div>
				);

			case MediaItemType.track:
				return (
					<div className={classes} onClick={this.onSelect.bind(this)}>
						<div className="image">
							<img src={(this.props.item as TrackIndexableObject).song_art_image_url}/>
						</div>
						<div className="meta">
							<div className="title">
								{this.props.item.title}
							</div>
							<div className="artist">
								{this.props.item.author}
							</div>
						</div>
					</div>
				);

			case MediaItemType.artist:
				let artistItem = this.props.item as ArtistIndexableObject;

				return (
					<div className="artist media-item" id={artistItem._id} onClick={this.onSelect.bind(this)}>
						<div className="image-container" style={{backgroundImage: `url(${artistItem.image_url})`}}>
							<ImageBrandMask />
						</div>
						<div className="meta">
							<div className="title">{artistItem.name}</div>
							<div className="subtitle">{artistItem.tracks_count} items</div>
						</div>
					</div>
				);
		}
	}
}
