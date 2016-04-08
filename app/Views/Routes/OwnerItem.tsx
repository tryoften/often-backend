import * as React from 'react';
import { Grid, Row, Col, Input, Thumbnail, ButtonInput, Glyphicon } from 'react-bootstrap';
import Owner, { OwnerAttributes } from '../../Models/Owner';
import QuoteForm from '../Components/QuoteForm';
import MediaItemView from '../Components/MediaItemView';
import { IndexableObject } from "../../Interfaces/Indexable";
import * as _ from 'underscore';
import * as objectPath from 'object-path';

interface OwnerItemProps extends React.Props<OwnerItem> {
	params: {
		ownerId: string;
	};
}

interface OwnerItemState extends React.Props<OwnerItem> {
	isNew?: boolean;
	model?: Owner;
	shouldShowQuoteForm?: boolean;
	currentQuoteId?: string;
	form?: OwnerAttributes;
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
			isNew: isNew,
			form: owner.toJSON(),
			shouldShowQuoteForm: false
		};

		_.bindAll(this, 'updateState', 'handlePropChange', 'handleUpdate', 'onClickQuote');
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

	handlePropChange(e: any) {
		let id = e.target.id;
		let form = this.state.form;
		objectPath.set(form, id, e.target.value);
		this.setState({form});
	}

	handleUpdate(e) {
		e.preventDefault();

		let model = this.state.model;
		let form = _.extend({}, this.state.model.toIndexingFormat(), this.state.form);
		model.save(form);
		this.setState({model: model, isNew: false, form});
	}


	onClickQuote(item: IndexableObject) {
		this.setState({
			currentQuoteId: item._id,
			shouldShowQuoteForm: true
		});
	}

	onClickAddItem(e: Event) {
		e.preventDefault();
		this.setState({shouldShowQuoteForm: true});
	}

	close() {
		this.setState({shouldShowQuoteForm: false});
	}

	render() {
		var itemsComponents = Object.keys(this.state.model.quotes || []).map(key => {
			let item = this.state.model.quotes[key];
			return <MediaItemView key={key} item={item} onSelect={this.onClickQuote.bind(this)} />;
		});

		var quoteForm = this.state.shouldShowQuoteForm ?
			(<QuoteForm owner={this.state.model}
						quoteId={this.state.currentQuoteId}
			   			show={this.state.shouldShowQuoteForm}
			   			onSaveChanges={this.close.bind(this)} />) : "";

		return (
			<div className="section">
				<header className="section-header">
					<h2>{this.state.model.get('name')}</h2>
				</header>

				{quoteForm}

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
											placeholder={this.state.model.get('name')}
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
