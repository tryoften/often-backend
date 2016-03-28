import * as React from 'react';
import classNames = require('classnames');;
import { Row, Col, Grid, ButtonToolbar, Button } from 'react-bootstrap';
import MediaItem from "../../Models/MediaItem";
import PackView from '../Components/PackView';
import config from '../../config';
import Pack from '../../Models/Pack';

interface PacksProps extends React.Props<Packs> {
	open?: boolean
}

interface PacksState extends React.Props<Packs> {
	packs?: MediaItem[];
}

export default class Packs extends React.Component<PacksProps, PacksState> {

	constructor(props: PacksProps) {
		super(props);

		this.state = {
			packs: []
		}
	}

	render() {
		let packComponents = this.state.packs.map(pack => {
			return <PackView model={pack} ></PackView>
		});

		return (
			<div className="section">
				<header className="section-header">
					<h2>Packs</h2>

					<ButtonToolbar className="pull-right">
						<Button bsStyle="primary" bsSize="small" active>Add Pack</Button>
					</ButtonToolbar>
				</header>

				<div className="content">
					{this.props.children}
				</div>
			</div>
		);
	}
}
