import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SearchBar, SearchBarState } from './SearchBar';
import { firebase as FirebaseConfig } from '../config';
import SearchResultsTable from './SearchResultsTable';
import * as Firebase from 'firebase';

interface AppProps {
}

export default class App extends React.Component<AppProps, {}> {
	onSearchBarChange(state: SearchBarState) {
		var request = new Firebase(`${FirebaseConfig.BaseURL}/queues/search/tasks`);
	}

	render() {
		return (
			<div>
				<SearchBar onChange={this.onSearchBarChange}/>
				<SearchResultsTable/>
			</div>
		);
	}
}

ReactDOM.render(
	<App />,
	document.getElementById('container')
);
