import * as React from 'react';

export interface IconProps extends React.Props<Icon> {
	className?: string;
	bundle?: string;
	glyph?: string;
}

export default class Icon extends React.Component<IconProps, {}> {
	render() {
		return (
			<div className="icon"></div>
		);
	}
}
