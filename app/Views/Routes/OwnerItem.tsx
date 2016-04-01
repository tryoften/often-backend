import * as React from 'react';
import { Grid, Row, Col, Input, Thumbnail, ButtonInput, Glyphicon } from 'react-bootstrap';
import Owner from '../../Models/Owner';
import * as _ from 'underscore';
import MediaItemView from '../Components/MediaItemView';

interface OwnerItemProps extends React.Props<OwnerItem> {
	params: {
		ownerId: string;
	};
}

interface OwnerItemState extends React.Props<OwnerItem> {
	isNew?: boolean;
	model?: Owner;
}

export default class OwnerItem extends React.Component<OwnerItemProps, OwnerItemState> {
	constructor(props: OwnerItemProps) {
		super(props);

		let isNew = false;

		var attr: any = {};
		if (props.params.ownerId) {
			attr.id = props.params.ownerId;
		} else {
			isNew = true;
		}

		let owner = new Owner(attr);

		this.state = {
			model: owner,
			isNew: isNew
		};

		_.bindAll(this, 'updateState', 'handleSmallImageChange', 'handleLargeImageChange',
			'handleUpdate', 'handleNameChange');
		owner.on('update', this.updateState.bind(this));
	}

	componentDidMount() {
		this.state.model.fetch({
			success: this.updateState.bind(this)
		});
	}

	updateState(owner: Owner) {
		this.setState({
			model: owner
		});
	}

	handleSmallImageChange(e) {
		var model = this.state.model;
		var imgObj = model.get('image');
		imgObj.small.url = e.target.value;
		model.set('image', imgObj);
		this.setState({model: model});
	}

	handleLargeImageChange(e) {
		var model = this.state.model;
		var imgObj = model.get('image');
		imgObj.large.url = e.target.value;
		model.set('image', imgObj);
		this.setState({model: model});
	}

	handleUpdate(e) {
		e.preventDefault();
		var model = this.state.model;
		model.save();
		this.setState({model: model, isNew: false});
	}

	handleNameChange(e) {
		var model = this.state.model;
		model.set('name', e.target.value);
		this.setState({model: model});
	}

	onClickQuote(e) {

	}

	onClickAddItem(e: Event) {
		e.preventDefault();
	}

	render() {
		var itemsComponents = Object.keys(this.state.model.quotes).map(key => {
			let item = this.state.model.quotes[key];
			return <MediaItemView key={item._id} item={item} />;
		});

		return (
			<div className="section">
				<header className="section-header">
					<h2>{this.state.model.get('name')}</h2>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col xs={6}>
							<form className="updateForm" onSubmit={this.handleUpdate}>
								<Row>
									<Col xs={8}>
										<Input
											type="text"
											label="Name"
											bsSize="medium"
											placeholder={this.state.model.get('name')}
											value={this.state.model.get('name')}
											onChange={this.handleNameChange}
										/>
									</Col>
								</Row>
								<Row>
									<Col xs={4}>
										<div className="image-upload">
											<Thumbnail src={this.state.model.get('image').small_url} />
										</div>
									</Col>
									<Col xs={8}>
										<Input
											type="text"
											label="Small Image"
											bsSize="medium"
											placeholder={this.state.model.get('image').small_url}
											value={this.state.model.get('image').small_url}
											onChange={this.handleSmallImageChange}
										/>
										<Input
											type="text"
											label="Large Image"
											bsSize="medium"
											placeholder={this.state.model.get('image').large_url}
											value={this.state.model.get('image').large_url}
											onChange={this.handleLargeImageChange}
										/>
									</Col>
								</Row>
								<Row>
									<div className="media-item-group">
										<h3>Items</h3>
										<div className="items">
											<div className="add-item pull-left" onClick={this.onClickAddItem.bind(this)}>
												<span className="text"><Glyphicon glyph="plus-sign" /> Add Item</span>
											</div>

											{itemsComponents}
										</div>
									</div>
								</Row>
								<Row>
									<Col xs={8}>
										<ButtonInput type="submit" value={this.state.isNew ? 'Create' : 'Update'} />
									</Col>
								</Row>
							</form>
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}
}
