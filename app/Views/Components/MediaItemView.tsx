import * as React from 'react';
import {IndexableObject} from "../../Interfaces/Indexable";
import MediaItemType from "../../Models/MediaItemType";
import { TrackIndexableObject } from "../../Models/Track";
import { ArtistIndexableObject } from "../../Models/Artist";

interface SearchResultItemViewProps {
	item: IndexableObject;
}

export default class MediaItemView extends React.Component<SearchResultItemViewProps, {}> {
	render() {
		switch (this.props.item._type) {
			case MediaItemType.lyric:
				return (
					<div className="media-item lyric pull-left">
						<div className="content">
							{this.props.item.text}
						</div>
					</div>
				);

			case MediaItemType.track:
				return (
					<div className="media-item track pull-left">
						<div className="image">
							<img src={(this.props.item as TrackIndexableObject).song_art_image_url} />
						</div>
						<div className="meta">
							<div class="title">
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
					<div className="artist media-item" id={artistItem._id}>
						<div className="image-container" style={{backgroundImage: `url(${artistItem.image_url})`}}>
							<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
								 className="mask" width="135px" height="21px" viewBox="0 0 135 21">
								<g id="Artboard-1" transform="translate(-87.000000, -224.000000)" fill="#FFFFFF">
									<path d="M222,224.283203 L222,245 L87,245 L222,224.283203 Z" id="mask"></path>
								</g>
							</svg>
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
