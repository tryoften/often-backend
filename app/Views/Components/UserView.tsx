import * as React from 'react';
import User from "../../Models/User";
import ImageBrandMask from '../Components/ImageBrandMask';

export interface UserViewProps extends React.Props<UserView> {
	model: User;
	onItemSelected?: (user: User) => void;
}

export default class UserView extends React.Component<UserViewProps, {}> {
	onClickEvent(e: Event) {
		if (this.props.onItemSelected) {
			this.props.onItemSelected(this.props.model);
		}
	}

	render() {
		return (
			<div className="user media-item" id={this.props.model.id} onClick={this.onClickEvent.bind(this)}>
				<div className="image-container" style={{backgroundImage: `url(${(this.props.model.get('image') || {}).small_url})`}}>
					<ImageBrandMask />
				</div>
				<div className="meta">
					<div className="title">{this.props.model.get('name')}</div>
					<div className="subtitle">0 items</div>
					<div className="description">{this.props.model.get('description')}</div>
				</div>
			</div>
		);
	}
}
