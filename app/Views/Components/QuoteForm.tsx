import * as React from 'react';
import Quote from '../../Models/Quote';
import { Input } from 'react-bootstrap';

interface QuoteFormProps extends React.Props<QuoteForm> {
	quoteId?: string;
}

interface QuoteFormState {
	textValue?: string;
	model?: Quote;
}

export default class QuoteForm extends React.Component<QuoteFormProps, QuoteFormState> {
	constructor(props: QuoteFormProps) {
		super(props);

		this.state = {
			textValue: '',
			model: props.quoteId ? new Quote({id: props.quoteId}) : new Quote()
		};
	}

	refs: {
		[string: string]: any;
		textInput: any;
	}

	onTextInputChange(e: Event) {
		e.preventDefault();
		this.setState({
			textValue: this.refs.textInput.getValue()
		});
	}

	render() {
		return (
			<div className="quote-form">
				<Input
					type="text"
					label="Text"
					placeholder="Enter quote text..."
					ref="textInput"
					value={this.state.textValue}
					onChange={this.onTextInputChange.bind(this)} />


			</div>
		);
	}
}
