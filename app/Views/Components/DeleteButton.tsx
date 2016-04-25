import * as React from 'react';
import { Button } from 'react-bootstrap';

interface DeleteButtonProps extends React.Props<DeleteButton> {
	showConfirmMessage?: boolean;
	onConfirmation?: (boolean) => void;
}

export default class DeleteButton extends React.Component<DeleteButtonProps, {}> {
	onClick(e) {
		if ( confirm("Are you sure you want to delete this item?") ) {
			this.props.onConfirmation(true);
		}
	}

	render() {
		return (
			<Button {...this.props} bsStyle="danger" onClick={this.onClick.bind(this)}>Delete</Button>
		);
	}
}
