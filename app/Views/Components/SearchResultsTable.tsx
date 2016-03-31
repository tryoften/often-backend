import * as React from 'react';
import Element = JSX.Element;
import Response from '../../Models/Response';
import MediaItemView from './MediaItemView';
import * as classNames from 'classnames';
import { PanelGroup, Panel } from 'react-bootstrap';

interface SearchResultsTableProps {
	response: Response;
}

export default class SearchResultsTable extends React.Component<SearchResultsTableProps, any> {
	render(): Element {
		var resultNodes = this.props.response.results.map((group, i) => {
			var rows = group.results.map(item => {
				return <MediaItemView key={item._id} item={item} />;
			});

			return (
				<Panel header={group.type} eventKey={i} key={i}>
					<div className={classNames("media-item-group clearfix", group.type as string)}>
						<div className="items">
							{rows}
						</div>
					</div>
				</Panel>
			);
		});

		return (
			<PanelGroup className="search-results" accordion>
				{resultNodes}
			</PanelGroup>
		);
	}
}
