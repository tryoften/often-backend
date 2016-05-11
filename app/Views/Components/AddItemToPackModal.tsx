import * as React from 'react';
import * as _ from 'underscore';
import { Modal, Tabs, Tab, Button, DropdownButton, MenuItem } from 'react-bootstrap';
import SearchPanel from '../Components/SearchPanel';
import Owners from '../../Collections/Owners';
import Owner from "../../Models/Owner";
import MediaItemView from '../Components/MediaItemView';
import {IndexableObject} from "../../Interfaces/Indexable";
import {PackAttributes} from '../../Models/Pack';
import Pack from '../../Models/Pack';
import {IndexablePackItem} from '../../Models/Pack';
import MediaItemType from '../../Models/MediaItemType';

interface AddItemToPackModalProps extends React.Props<AddItemToPackModal> {
	show: boolean;
	packItems?: IndexablePackItem[];
	onUpdatePackItems?: (selectedItems: IndexablePackItem[]) => void;
}

interface AddItemToPackModalState {
	showModal?: boolean;
	owners?: Owners;
	selectedOwner?: Owner;
	selectedItems?: IndexablePackItem[];
}

export default class AddItemToPackModal extends React.Component<AddItemToPackModalProps, AddItemToPackModalState> {
	owners: Owners;

	constructor(props: AddItemToPackModalProps) {
		super(props);

		this.owners = new Owners();

		this.state = {
			selectedItems: props.packItems || [],
			showModal: props.show,
			owners: this.owners
		};

		this.onSelectOwnerChange = this.onSelectOwnerChange.bind(this);
		this.updateStateWithModel = this.updateStateWithModel.bind(this);
		this.onSaveChanges = this.onSaveChanges.bind(this);
		this.onSelectItem = this.onSelectItem.bind(this);
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

	onSelectItem(item: IndexablePackItem) {
		let selectedItems: IndexablePackItem[] = this.state.selectedItems;
		let formItemIndex = _.findIndex(selectedItems, (formItem) => {
			return (formItem.id === item.id);
		});
		if (formItemIndex > -1) {
			/* Item already selected, so unselect it from the list */
			selectedItems.splice(formItemIndex, 1);
		} else {
			/* Item not selected, so add it to the list */
			selectedItems.push(item);
		}

		this.setState({
			selectedItems: selectedItems
		});
	}


	onSaveChanges(e) {
		e.preventDefault();
		this.props.onUpdatePackItems(this.state.selectedItems);
		this.setState({showModal: false});
	}

	close() {
		this.setState({showModal: false});
	}

	render() {
		let ownersSelector = this.owners.models.map(model => {
			return <MenuItem key={model.id} value={model.id}>{model.get('name')}</MenuItem>;
		});

		let ownerQuotes = this.state.selectedOwner ? Object.keys(this.state.selectedOwner.get('quotes') || []).map(key => {
			let quote = this.state.selectedOwner.get('quotes')[key];
			let foundQuote = _.findWhere(this.state.selectedItems, {
				id: quote.id,
				type: MediaItemType.quote
			});
			if (!!foundQuote) {
				return (<div className="media-item-selector selected" key={key}>
					<MediaItemView key={key} item={quote} onSelect={this.onSelectItem.bind(this)} />
				</div>);
			} else {
				return (<div className="media-item-selector unselected" key={key}>
					<MediaItemView key={key} item={quote} onSelect={this.onSelectItem.bind(this)} />
					</div>);
			}

		}) : "";

		let gifs =  this.state.selectedOwner ? Object.keys(this.state.selectedOwner.get('gifs') || []).map(key => {
			let item = this.state.selectedOwner.get('gifs')[key];
			let foundGif = _.findWhere(this.state.selectedItems, {
				id: item.id,
				type: MediaItemType.gif
			});
			if (!!foundGif) {
				return (<div className="media-item-selector selected">
					<MediaItemView key={key} item={item} onSelect={this.onSelectItem.bind(this)} />
				</div>);
			} else {
				return (<div className="media-item-selector unselected">
					return <MediaItemView key={key} item={item} onSelect={this.onSelectItem.bind(this)} />;
				</div>);
			}

		}) : "";

		let ownerName = this.state.selectedOwner ? this.state.selectedOwner.get('name') : '';

		return (
			<Modal show={this.state.showModal} onHide={this.close.bind(this)} bsSize="large">
				<Modal.Body>
					<Tabs id="uncontrolled-modal-tab">
						<Tab eventKey={0} title="Add New Quote">
							<div className="container-fluid">
								<DropdownButton
									id="owner-dropdown"
									title={ownerName}
									label="Select Owner"
									onChange={this.onSelectOwnerChange}>
									{ownersSelector}
								</DropdownButton>
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
					<Button onClick={this.onSaveChanges} bsStyle="primary">Save changes</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
