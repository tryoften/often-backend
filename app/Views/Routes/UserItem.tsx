import * as React from 'react';
import { Grid, Row, Col, Input, Thumbnail, ButtonInput } from 'react-bootstrap';
import User, { UserAttributes } from '../../Models/User';
import MediaItemView from '../Components/MediaItemView';
import { IndexableObject } from "../../Interfaces/Indexable";
import * as _ from 'underscore';
import * as objectPath from 'object-path';

interface UserItemProps extends React.Props<UserItem> {
	params: {
		ownerId: string;
	};
}

interface UserItemState extends React.Props<UserItem> {
	isNew?: boolean;
	model?: User;
	shouldShowQuoteForm?: boolean;
	shouldShowGIFForm?: boolean;
	currentQuoteId?: string;
	currentGIFId?: string;
	form?: UserAttributes;
}

export default class UserItem extends React.Component<UserItemProps, UserItemState> {
	constructor(props: UserItemProps) {
		super(props);

		let isNew = false;

		var attr: any = {};
		if (props.params.ownerId) {
			attr.id = props.params.ownerId;
		} else {
			isNew = true;
		}
		let owner = new User(attr);

		this.state = {
			model: owner,
			isNew: isNew,
			form: owner.toJSON(),
			shouldShowQuoteForm: false,
			shouldShowGIFForm: false
		};

		_.bindAll(this, 'updateState', 'handlePropChange', 'handleUpdate', 'onClickQuote');
		owner.on('update', this.updateState.bind(this));
		owner.syncData();
	}

	componentDidMount() {
		this.state.model.fetch({
			success: this.updateState.bind(this)
		});
	}

	updateState(owner: User) {
		this.setState({
			model: owner,
			form: owner.toJSON()
		});
	}

	handlePropChange(e: any) {
		let id = e.target.id;
		let form = this.state.form;
		objectPath.set(form, id, e.target.value);
		this.setState({form});
	}

	handleUpdate(e) {
		e.preventDefault();

		let model = this.state.model;
		let form = _.extend({}, this.state.form);
		model.save(form);
		this.setState({model: model, isNew: false, form});
	}


	onClickQuote(item: IndexableObject) {
		this.setState({
			currentQuoteId: item._id,
			shouldShowQuoteForm: true
		});
	}

	onClickAddQuote(e: Event) {
		e.preventDefault();
		this.setState({shouldShowQuoteForm: true});
	}

	onClickAddGIF(e: Event) {
		e.preventDefault();
		this.setState({shouldShowGIFForm: true});
	}

	close() {
		this.setState({shouldShowQuoteForm: false, shouldShowGIFForm: false});
		this.state.model.syncData().then((model) => {
			this.setState({model: this.state.model});
		});
	}

	render() {
		var itemsComponents = Object.keys(this.state.model.packs || []).map(key => {
			let item = this.state.model.packs[key];
			return <MediaItemView key={key} item={item} onSelect={this.onClickQuote.bind(this)} />;
		});

		return (
			<div className="section">
				<header className="section-header">
					<h2>{this.state.form.name}</h2>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col xs={6}>
							<form className="updateForm" onSubmit={this.handleUpdate}>
								<Row>
									<Col xs={8}>
										<Input
											id="name"
											type="text"
											label="Name"
											bsSize="medium"
											value={this.state.form.name}
											onChange={this.handlePropChange}
										/>
									</Col>
								</Row>
								<Row>
									<Col xs={4}>
										<div className="image-upload">
											<Thumbnail src={this.state.form.image.small_url} />
										</div>
									</Col>
									<Col xs={8}>
										<Input
											id="image.small_url"
											type="text"
											label="Small Image"
											bsSize="medium"
											value={this.state.form.image.small_url}
											onChange={this.handlePropChange}
										/>
										<Input
											id="image.large_url"
											type="text"
											label="Large Image"
											bsSize="medium"
											value={this.state.form.image.large_url}
											onChange={this.handlePropChange}
										/>
									</Col>
								</Row>
								<Row>
									<Col xs={8}>
										<ButtonInput type="submit" value={this.state.isNew ? 'Create' : 'Save'} />

									</Col>
								</Row>
								<Row>
									<div className="media-item-group">
										<h3>Items</h3>

										<div className="items clearfix">
											{itemsComponents}
										</div>
									</div>
								</Row>
							</form>
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}
}
