import * as React from 'react';

interface AddItemToPackModalProps extends React.Props<AddItemToPackModal> {
	show: boolean;
}

interface SearchPanelState {
	showModal?: boolean;
}

class AddItemToPackModal extends React.Component<AddItemToPackModalProps> {
	constructor(props: AddItemToPackModalProps) {
		super(props);

		this.state = {
			showModal: props.show
		};
	}

	close() {
		this.setState({showModal: false});
	}

	render() {
		return (
			<Modal show={this.state.showModal} onHide={this.close.bind(this)} bsSize="large">
				<Modal.Body>
					<Tabs>
						<Tab eventKey={0} title="Quote">
							<QuoteForm />
						</Tab>
						<Tab eventKey={1} title="Lyric">
							<div>
								<SearchBar />
								<SearchResultsTable />
							</div>
						</Tab>
					</Tabs>
				</Modal.Body>
			</Modal>
		);
	}
}
