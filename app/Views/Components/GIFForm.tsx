import * as React from 'react';
import GIF, { GIFAttributes } from '../../Models/GIF';
import { Input, Modal, Button, Thumbnail } from 'react-bootstrap';
import Owner from "../../Models/Owner";
import * as _ from 'underscore';
import * as objectPath from 'object-path';

interface GIFFormProps extends React.Props<GIFForm> {
	gifId?: string;
	owner: Owner;
	onSaveChanges?: (event: Event) => void;
	show?: boolean;
}

interface GIFFormState {
	model?: GIF;
	form?: GIFAttributes;
	isNew?: boolean;
	showModal?: boolean;
}

export default class GIFForm extends React.Component<GIFFormProps, GIFFormState> {
	constructor(props: GIFFormProps) {
		super(props);

		this.setupModel(props);

		this.updateStateWithGIF = this.updateStateWithGIF.bind(this);
		this.handlePropChange = this.handlePropChange.bind(this);
		this.handleGiphyIDChange = this.handleGiphyIDChange.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
	}

	setupModel(props: GIFFormProps) {
		let isNew = !props.gifId;

		let attributes: any = {
			owner_name: props.owner.name,
			owner_id: props.owner.id,
			id: props.gifId
		};

		let gif = new GIF(attributes);

		this.state = {
			model: gif,
			form: gif.toJSON(),
			isNew: isNew,
			showModal: props.show
		};

		gif.on('update', this.updateStateWithGIF);
	}

	componentDidMount() {
		this.state.model.fetch({
			success: this.updateStateWithGIF
		});
	}

	updateStateWithGIF(model: GIF) {
		this.setState({
			model: model,
			form: model.toJSON()
		});
	}

	componentWillReceiveProps(nextProps: GIFFormProps) {
		this.state.model.off('update', this.updateStateWithGIF);
		this.setupModel(nextProps);

		this.setState({
			showModal: nextProps.show
		});
	}

	close() {
		this.setState({
			showModal: false
		});
	}

	handlePropChange(e: any) {
		let id = e.target.id;
		let form = this.state.form;
		objectPath.set(form, id, e.target.value);
		this.setState({form});
	}

	handleGiphyIDChange(e: any) {
		this.handlePropChange(e);
		let giphyId = e.target.value;
		this.state.model.set({giphy_id: giphyId}, { silent: true });
		this.setState({model: this.state.model, form: this.state.model.toJSON()});
	}

	handleUpdate(e: Event) {
		e.preventDefault();

		let model = this.state.model;
		let owner = {
			owner_name: this.props.owner.name,
			owner_id: this.props.owner.id,
		};
		let form = _.extend(this.state.model.toIndexingFormat(), this.state.form, owner);
		model.save(form);
		this.setState({model: model, isNew: false, showModal: false, form});
		this.props.onSaveChanges(e);
	}

	render() {
		return (
			<Modal show={this.state.showModal} onHide={this.close.bind(this)} bsSize="large">
				<Modal.Body>
					<div className="gif-form">
						<Input
							id="giphy_id"
							type="text"
							label="Giphy ID"
							placeholder="Enter giphy..."
							value={this.state.form.giphy_id}
							help="You can find the Giphy ID for a gif in the URL (i.e. http://giphy.com/gifs/<b>h0MTqLyvgG0Ss</b>/html5)"
							onChange={this.handleGiphyIDChange} />

						<Input
							id="description"
							type="textarea"
							label="Description"
							placeholder="Enter description..."
							value={this.state.form.description}
							onChange={this.handlePropChange} />

						<Input
							id="tags"
							type="text"
							label="Tags"
							placeholder="Enter tags..."
							value={this.state.form.tags}
							onChange={this.handlePropChange} />
					</div>
					<div className="gif-preview">
						<Thumbnail src={this.state.form.image.medium_url} />
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
