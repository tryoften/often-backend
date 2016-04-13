import * as React from 'react';
import { Modal, Tabs, Tab, Button, Input } from 'react-bootstrap';
import SearchPanel from '../Components/SearchPanel';
import Owners from '../../Collections/Owners';
import Owner from "../../Models/Owner";
import MediaItemView from '../Components/MediaItemView';
import {IndexableObject} from "../../Interfaces/Indexable";

interface AddItemToPackModalProps extends React.Props<AddItemToPackModal> {
	show: boolean;
	onSelectItem: (item: IndexableObject) => void;
}

interface AddItemToPackModalState {
	showModal?: boolean;
	owners?: Owners;
	selectedOwner?: Owner;
}

export default class AddItemToPackModal extends React.Component<AddItemToPackModalProps, AddItemToPackModalState> {
	owners: Owners;

	constructor(props: AddItemToPackModalProps) {
		super(props);

		this.owners = new Owners();

		this.state = {
			showModal: props.show,
			owners: this.owners
		};

		this.onSelectOwnerChange = this.onSelectOwnerChange.bind(this);
		this.updateStateWithModel = this.updateStateWithModel.bind(this);
		this.owners.on('update', this.updateStateWithModel);
	}

	updateStateWithModel(owners: Owners) {
		this.setState({
			owners,
			selectedOwner: owners.models.length ? owners.models[0] : null
		});
	}

	componentDidMount() {
		this.state.owners.fetch({
			success: this.updateStateWithModel
		});
	}

	componentWillUnmount() {
		this.owners.off('update', this.updateStateWithModel);
	}

	componentWillReceiveProps(nextProps: AddItemToPackModalProps) {
		this.setState({
			showModal: nextProps.show
		});
	}

	onSelectOwnerChange(e) {
		let owner = this.state.owners.get(e.target.value);
		this.setState({selectedOwner: owner});
	}

	onSelectItem(item: IndexableObject) {
		this.props.onSelectItem(item);
		this.setState({
			showModal: false
		});
	}

	close() {
		this.setState({showModal: false});
	}

	render() {
		let ownersSelector = this.owners.models.map(model => {
			return <option value={model.id}>{model.get('name')}</option>;
		});

		let ownerQuotes = this.state.selectedOwner ? Object.keys(this.state.selectedOwner.get('quotes')).map(key => {
			let quote = this.state.selectedOwner.get('quotes')[key];
			return <MediaItemView key={key} item={quote} onSelect={this.onSelectItem.bind(this)} />;
		}) : "";

		let gifs =  this.state.selectedOwner ? Object.keys(this.state.selectedOwner.get('gifs') || []).map(key => {
			let item = this.state.selectedOwner.get('gifs')[key];
			return <MediaItemView key={key} item={item} onSelect={this.onSelectItem.bind(this)} />;
		}) : "";

		return (
			<Modal show={this.state.showModal} onHide={this.close.bind(this)} bsSize="large">
				<Modal.Body>
					<Tabs>
						<Tab eventKey={0} title="Add New Quote">
							<div className="container-fluid">
								<Input
									type="select"
									label="Select Owner"
									onChange={this.onSelectOwnerChange}>
									{ownersSelector}
								</Input>
								<div className="media-item-group">
									<div className="items">{gifs}</div>
									<div className="items">{ownerQuotes}</div>
								</div>
							</div>
						</Tab>
						<Tab eventKey={1} title="Find Lyric or Quote">
							<SearchPanel presentInModal={false} />
						</Tab>
					</Tabs>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.close.bind(this)}>Close</Button>
					<Button bsStyle="primary">Save changes</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
