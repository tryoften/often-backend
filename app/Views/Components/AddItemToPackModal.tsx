import * as React from 'react';
import { Modal, Tabs, Tab, Button } from 'react-bootstrap';
import QuoteForm from '../Components/QuoteForm';
import SearchPanel from '../Components/SearchPanel';

interface AddItemToPackModalProps extends React.Props<AddItemToPackModal> {
	show: boolean;
}

interface AddItemToPackModalState {
	showModal?: boolean;
}

export default class AddItemToPackModal extends React.Component<AddItemToPackModalProps, AddItemToPackModalState> {
	constructor(props: AddItemToPackModalProps) {
		super(props);

		this.state = {
			showModal: props.show
		};
	}

	componentWillReceiveProps(nextProps: AddItemToPackModalProps) {
		this.setState({
			showModal: nextProps.show
		});
	}

	close() {
		this.setState({showModal: false});
	}

	render() {
		return (
			<Modal show={this.state.showModal} onHide={this.close.bind(this)} bsSize="large">
				<Modal.Body>
					<Tabs>
						<Tab eventKey={0} title="Add New Quote">
							<QuoteForm />
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
