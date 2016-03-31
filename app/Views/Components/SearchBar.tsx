import * as React from 'react';
import { Input } from 'react-bootstrap';
import Element = JSX.Element;

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
			<form className="searchBox" onSubmit={this.handleSubmit}>
				<Input
					type="text"
					label="Search"
					bsSize="normal"
					placeholder="Search for lyrics, songs, artists or packs..."
					value={this.state.query}
					onChange={this.handleTextInputChange.bind(this)}
				/>
			</form>
		);
	}
}
