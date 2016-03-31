import * as React from 'react';
import * as _ from 'underscore';
import classNames = require('classnames');
import { Row, Col, Grid } from 'react-bootstrap';

var HeaderNavigation = React.createClass({
	render() {
		var props = _.defaults(this.props, {
			'className': classNames('pull-right', this.props.className)
		});

		return (
			<div className={props.className}></div>
		);
	}
});

export default class Header extends React.Component<{}, {}> {
	render() {
		return (
			<Grid id='navbar' {...this.props}>
				<Row>
					<Col xs={12}>
						<div fixedTop id='rubix-nav-header'>
							<div className="container fluid">
								<Row>
									<Col xs={3} visible='xs'>
									</Col>
									<Col xs={6} sm={4}>
										<h1>Often</h1>
									</Col>
									<Col xs={3} sm={8}>
										<HeaderNavigation />
									</Col>
								</Row>
							</div>
						</div>
					</Col>
				</Row>
			</Grid>
		);
	}
}
