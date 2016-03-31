import * as React from 'react';
import Element = JSX.Element;
import Response from '../../Models/Response';
import MediaItemView from './MediaItemView';
import * as classNames from 'classnames';
import { PanelGroup, Panel, Badge } from 'react-bootstrap';

interface SearchResultsTableProps {
	response: Response;
}


export default class SearchResultsTable extends React.Component<SearchResultsTableProps, any> {
	constructor(props: SearchResultsTableProps) {
		super(props);

		this.state = {
			activeKey: 0
		};
	}

	handleSelect(activeKey: number) {
		this.setState({ activeKey });
	}

	render(): Element {
		var resultNodes = this.props.response.results.map((group, i) => {
			var rows = group.results.map(item => {
				return <MediaItemView key={item._id} item={item} />;
			});

			let header = (
				<span><Badge className="pull-right">{rows.length}</Badge> {group.type}s</span>
			);

			return (
				<Panel header={header} eventKey={i} key={i}>
					<div className={classNames("media-item-group clearfix", group.type as string)}>
						<div className="items">
							{rows}
						</div>
					</div>
				</Panel>
			);
		});

		return (
			<PanelGroup activeKey={this.state.activeKey} className="search-results" onSelect={this.handleSelect.bind(this)} accordion>
				{resultNodes}
			</PanelGroup>
		);
	}
}
