import * as React from 'react';
import Sidebar from '../Components/Sidebar';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';

interface HomeProps extends ReactRouter.RouteComponentProps<Home, {}> {
	open?: boolean;
}

export default class Home extends React.Component<HomeProps, {}> {
	render() {
		return (
			<div id='container'>
				<Sidebar />
				<div id='body'>
					<ReactCSSTransitionGroup
						component="div"
						transitionName="page"
						transitionEnterTimeout={200}
						transitionLeaveTimeout={200}>
						{React.cloneElement(this.props.children || <div></div>, {
							key: this.props.location.pathname
							})}
					</ReactCSSTransitionGroup>
				</div>
			</div>
		);
	}
}
