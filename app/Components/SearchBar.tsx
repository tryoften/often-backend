import * as React from 'react';
import Element = JSX.Element;

export interface SearchBarProps {
	onChange: Function;
}

export interface SearchBarState {
	query: string;
}

export class SearchBar extends React.Component<SearchBarProps, SearchBarState> {
	constructor(props: SearchBarProps) {
		super(props);
		this.state = this.getInitialState();
	}

	handleSubmit(e: Event) {
		e.preventDefault();
	}

	getInitialState(): SearchBarState {
		return {
			query: ""
		};
	}

	handleTextInputChange(e: Event) {
		e.preventDefault();
	}

	render(): Element {
		return (
			<form className="searchBox" onSubmit={this.handleSubmit}>
				<input
					type="text"
					placeholder="Search..."
					value={this.state.query}
					onChange={this.handleTextInputChange}
				/>
				<input type="submit" value="Post" />
			</form>
		);
	}
}
