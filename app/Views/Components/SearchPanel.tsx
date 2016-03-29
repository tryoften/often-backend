import * as React from 'react';
import SearchBar, { SearchBarState } from './SearchBar';
import SearchResultsTable from './SearchResultsTable';
import * as Firebase from 'firebase';
import Request from '../../Models/Request';
import RequestType from "../../Models/RequestType";
import Response from "../../Models/Response";

interface AppProps {
}

interface AppState {
	response: Response;
}

export default class SearchPanel extends React.Component<AppProps, AppState> {
	searchQueue: Firebase;

	constructor(props: AppProps) {
		super(props);
		this.searchQueue = new Firebase(`https://often-dev.firebaseio.com/queues/search/tasks`);
		this.state = {
			response: new Response({id: "top"})
		};
	}

	onSearchBarChange(state: SearchBarState) {
		if (!state.query) {
			return;
		}

		var id = new Buffer(state.query.trim()).toString('base64');
		var request = new Request({
			id: id,
			query: {
				text: state.query.trim()
			},
			type: RequestType.search
		});

		this.searchQueue.child(id).set(request.toJSON());
		console.log(request.toJSON());

		var response = new Response({
			id: id
		});

		response.on('change', (data) => {
			console.log(data);
			this.setState({response});
		});
	}

	render() {
		return (
			<div className="search-panel">
				<SearchBar onChange={this.onSearchBarChange.bind(this)}/>
				<SearchResultsTable response={this.state.response} />
			</div>
		);
	}
}
