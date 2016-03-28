import * as React from 'react';
import classNames = require('classnames');;
import { Row, Col, Grid } from 'react-bootstrap';
import SearchPanel from '../Components/SearchPanel';

interface CategoriesProps extends React.Props<Categories> {
	open?: boolean
}

export default class Categories extends React.Component<CategoriesProps, {}> {
	render() {
		return (
			<div>
				<h2>Categories</h2>
				<SearchPanel />
			</div>
		);
	}
}
