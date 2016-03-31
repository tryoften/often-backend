import * as React from 'react';
import Quote from '../../Models/Quote';
import { Input } from 'react-bootstrap';

interface QuoteFormProps extends React.Props<QuoteForm> {
	model: Quote;
}

class QuoteForm extends React.Component<QuoteFormProps, {}> {
	constructor(props: QuoteFormProps) {
		super(props);

		this.state = {
			value: ''
		};
	}

	onTextInputChange(e: Event) {
		e.preventDefault();
	}

	render() {
		return (
			<div className="quote-form">
				<Input
					label="Text"
					value={this.state.value}
					onChange={this.onTextInputChange.bind(this)} />
			</div>
		);
	}
}
