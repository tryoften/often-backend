import * as React from 'react';
import Element = JSX.Element;

var Form = require('react-bootstrap/lib/Form');
var FormGroup = require('react-bootstrap/lib/FormGroup');
var FormControl = require('react-bootstrap/lib/FormControl');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');

export interface SearchBarProps {
	onChange: Function;
}

export interface SearchBarState {
	query: string;
}

export default class SearchBar extends React.Component<SearchBarProps, SearchBarState> {
	constructor(props: SearchBarProps) {
		super(props);
		this.state = {
			query: ""
		};
	}

	handleSubmit(e: Event) {
		e.preventDefault();
	}

	handleTextInputChange(e: any) {
		e.preventDefault();
		this.setState({query: e.target.value});
		this.props.onChange(this.state);
	}

	render(): Element {
		return (
			<Form>
				<FormGroup>
					<ControlLabel>Search</ControlLabel>
					<FormControl
						type="text"
						placeholder="Search for lyrics, songs, artists or packs..."
						bsSize="normal"
						value={this.state.query}
						onChange={this.handleTextInputChange.bind(this)}/>
				</FormGroup>
			</Form>
		);
	}
}
