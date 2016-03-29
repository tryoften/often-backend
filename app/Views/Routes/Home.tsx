import * as React from 'react';
import classNames = require('classnames');
import { Row, Col, Grid } from 'react-bootstrap';

import Sidebar from '../Components/Sidebar';

interface HomeProps extends React.Props<Home> {
	open?: boolean
}

export default class Home extends React.Component<HomeProps, {}> {
	render() {
		var classes = classNames({
			'container-open': this.props.open
		});

		return (
			<div id='container'>
				<Sidebar />
				<div id='body'>
					{this.props.children}
				</div>
			</div>
		);
	}
}
