import * as React from 'react';
import classNames = require('classnames');;
import { Row, Col, Grid } from 'react-bootstrap';

interface CategoriesProps extends React.Props<Categories> {
	open?: boolean
}

export default class Categories extends React.Component<CategoriesProps, {}> {
	render() {
		return (
			<div>
				<h2>Categories</h2>
			</div>
		);
	}
}
