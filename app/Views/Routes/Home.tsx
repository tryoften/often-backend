import * as React from 'react';
import classNames = require('classnames');
import SidebarMixin from '../Mixins/SidebarMixin';
import { Row, Col, Grid } from 'react-bootstrap';

import Sidebar from '../Components/Sidebar';

interface HomeProps extends React.Props<Home> {
	open?: boolean
}

@SidebarMixin
export default class Home extends React.Component<HomeProps, {}> {
	render() {
		var classes = classNames({
			'container-open': this.props.open
		});

		return (
			<div id='container' className={classes}>
				<Sidebar />
				<div id='body'>
					<Grid fluid={true}>
						<Row>
							<Col sm={12}>
								{this.props.children}
							</Col>
						</Row>
					</Grid>
				</div>
			</div>
		);
	}
}
