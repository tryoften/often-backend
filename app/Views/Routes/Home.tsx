import * as React from 'react';
import Sidebar from '../Components/Sidebar';

interface HomeProps extends React.Props<Home> {
	open?: boolean;
}

export default class Home extends React.Component<HomeProps, {}> {
	render() {
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
