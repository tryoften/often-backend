import * as React from 'react';
import Element = JSX.Element;
import Response from '../../Models/Response';
import MediaItemView from './MediaItemView';
import * as classNames from 'classnames';

interface SearchResultsTableProps {
	response: Response;
}

export default class SearchResultsTable extends React.Component<SearchResultsTableProps, any> {
	render(): Element {
		var resultNodes = this.props.response.results.map(group => {
			var rows = group.results.map(item => {
				return <MediaItemView item={item} />;
			});

			return (
				<div className={classNames("media-item-group clearfix", group.type as string)}>
					<h3>{group.type}s</h3>
					<div class="items">
						{rows}
					</div>
				</div>
			);
		});

		return (
			<div className="search-results">
				{resultNodes}
			</div>
		);
	}
}
