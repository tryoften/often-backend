import * as React from 'react';

class SearchBar extends React.Component<any> {
	handleSubmit(e) {
		e.preventDefault();
	}

	render() {
		return (
			<form className="searchBox" onSubmit={this.handleSubmit}>
				<input
					type="text"
					placeholder="Your name"
					value={this.state.author}
					onChange={this.handleAuthorChange}
				/>
				<input
					type="text"
					placeholder="Say something..."
					value={this.state.text}
					onChange={this.handleTextChange}
				/>
				<input type="submit" value="Post" />
			</form>
		);
	}
}
