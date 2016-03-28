import * as React from 'react';
import Element = JSX.Element;
import Response from '../../Models/Response';
import SearchResultItemView from './SearchResultItemView';

interface SearchResultsTableProps {
	response: Response;
}

export default class SearchResultsTable extends React.Component<SearchResultsTableProps, any> {
	render(): Element {
		var resultNodes = this.props.response.results.map(group => {
			var rows = group.results.map(item => {
				return <SearchResultItemView item={item} />;
			});

			return (<div className="group">
				{rows}
			</div>);
		});

		return (
			<div className="search-results">
				{resultNodes}
			</div>
		);
	}
}
