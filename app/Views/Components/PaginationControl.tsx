import * as _ from 'underscore';
import * as React from 'react';
import { ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';
const ReactPaginate = require('react-paginate');

export interface IndexRange {
	start: number;
	end: number;
}

interface PaginationControlProps extends React.Props<PaginationControl> {
	items?: React.ReactNode[];
	pageSize?: number;
}

interface PaginationControlState {
	pageSize?: number;
	numPages?: number;
	activePage?: number;
	indexRange?: IndexRange;
}

export default class PaginationControl extends React.Component<PaginationControlProps, PaginationControlState> {
	static perPageDefaults = [10, 50, 100, 1000];

	constructor(props: PaginationControlProps) {
		super(props);

		this.calculateNumberOfPages = this.calculateNumberOfPages.bind(this);
		this.getIndexRange = this.getIndexRange.bind(this);
		this.getPaginationControls = this.getPaginationControls.bind(this);
		this.handlePageClick = this.handlePageClick.bind(this);
		this.onPageSizeChange = this.onPageSizeChange.bind(this);



		this.state = {
			pageSize: 0,
			numPages: 0,
			activePage: 0,
			indexRange: {
				start: 0,
				end: 0
			}
		};

		debugger;
	}

	componentDidMount() {
		let pageSize = this.props.pageSize ? this.props.pageSize : PaginationControl.perPageDefaults[0];
		this.onPageSizeChange(pageSize, null);
	}

	componentWillReceiveProps(nextProps: PaginationControlProps) {
		this.setState({
			numPages: this.calculateNumberOfPages(),
			indexRange: this.getIndexRange(this.state.activePage)
		});
	}

	calculateNumberOfPages(): number {
		let numItems = this.props.items.length;
		var pageNum = Math.floor(numItems / this.state.pageSize);
		return (numItems % this.state.pageSize) ? pageNum + 1 : pageNum;
	}

	getIndexRange(pageIndex: number): IndexRange {
		let pageSize = this.state.pageSize;
		let start = (pageIndex) * pageSize;
		return {
			start: start,
			end: start + pageSize - 1
		};
	}

	getPaginationControls(): React.ReactNode {
		let menuItems = PaginationControl.perPageDefaults.map((pageDefault) => {
			return (<MenuItem eventKey={pageDefault} key={pageDefault}>{pageDefault}</MenuItem>);
		});

		return (
			<div>
				<ReactPaginate
					pageNum={this.calculateNumberOfPages()}
					pageRangeDisplayed={5}
					marginPagesDisplayed={1}
					containerClassName={"pagination"}
					subContainerClassName={"pages pagination"}
					breakLabel={<a href="">...</a>}
					activeClassName={"active"}
					previousLabel={"previous"}
					nextLabel={"next"}
					clickCallback={this.handlePageClick}
				/>
				<div className="page-size-select">
					<ButtonToolbar>
						<DropdownButton
							title={this.state.pageSize}
							id="dropdown-size-medium"
							onSelect={this.onPageSizeChange}
							key="dropdown-size-medium"
							dropup>
							{menuItems}
						</DropdownButton>
					</ButtonToolbar>
				</div>
			</div>
		);
	}

	handlePageClick(e) {
		this.setState({
			activePage: e.selected,
			indexRange: this.getIndexRange(e.selected)
		});
	}

	onPageSizeChange(numItems: number, e: Event) {
		this.setState({
			pageSize: numItems,
			numPages: this.calculateNumberOfPages(),
			indexRange: this.getIndexRange(this.state.activePage)
		});
	}

	render() {
		let range = this.state.indexRange;
		console.log('range', range);

		let components = this.props.items.slice(range.start, range.end);

		return (
			<div className="pagination">
				<div className="items">
					{components}
				</div>
				<div className="footer fixed">
					{this.getPaginationControls()}
				</div>
			</div>
		);
	}
}
