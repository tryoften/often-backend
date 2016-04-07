import * as React from 'react';
import Quote, { QuoteAttributes } from '../../Models/Quote';
import { Input, Modal, Button } from 'react-bootstrap';
import Owner from "../../Models/Owner";
import * as _ from 'underscore';
import * as objectPath from 'object-path';

interface QuoteFormProps extends React.Props<QuoteForm> {
	quoteId?: string;
	owner: Owner;
	onSaveChanges?: (event: Event) => void;
	show?: boolean;
}

interface QuoteFormState {
	model?: Quote;
	form?: QuoteAttributes;
	isNew?: boolean;
	showModal?: boolean;
}

export default class QuoteForm extends React.Component<QuoteFormProps, QuoteFormState> {
	constructor(props: QuoteFormProps) {
		super(props);

		this.setupModel(props);

		this.updateStateWithQuote = this.updateStateWithQuote.bind(this);
		this.handlePropChange = this.handlePropChange.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
	}

	setupModel(props: QuoteFormProps) {
		let isNew = !props.quoteId;

		let attributes: any = {
			owner_name: props.owner.name,
			owner_id: props.owner.id,
			id: props.quoteId
		};

		let quote = new Quote(attributes);

		this.state = {
			model: quote,
			form: quote.toJSON(),
			isNew: isNew,
			showModal: props.show
		};

		quote.on('update', this.updateStateWithQuote);
	}

	componentDidMount() {
		this.state.model.fetch({
			success: this.updateStateWithQuote
		});
	}

	updateStateWithQuote(model: Quote) {
		this.setState({
			model: model,
			form: model.toJSON()
		});
	}

	componentWillReceiveProps(nextProps: QuoteFormProps) {
		this.state.model.off('update', this.updateStateWithQuote);
		this.setupModel(nextProps);

		this.setState({
			showModal: nextProps.show
		});
	}

	close() {
		this.setState({showModal: false});
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
		this.setState({model: model, isNew: false, showModal: false, form});
		this.props.onSaveChanges(e);
	}

	render() {
		return (
			<Modal show={this.state.showModal} onHide={this.close.bind(this)} bsSize="large">
				<Modal.Body>
					<div className="quote-form">
						<Input
							id="text"
							type="textarea"
							label="Text"
							placeholder="Enter quote text..."
							value={this.state.form.text}
							onChange={this.handlePropChange} />

						<Input
							id="origin"
							type="text"
							label="Origin"
							placeholder="Enter quote origin (Book name, etc...)"
							value={this.state.form.origin}
							onChange={this.handlePropChange} />
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.close.bind(this)}>Close</Button>
					<Button bsStyle="primary" onClick={this.handleUpdate} >Save changes</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
