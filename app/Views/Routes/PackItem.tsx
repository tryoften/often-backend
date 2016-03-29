import * as React from 'react';
import { Grid, Row, Col, Input } from 'react-bootstrap';
import Pack from "../../Models/Pack";
import MediaItemView from "../Components/MediaItemView";

interface PackItemProps extends React.Props<PackItem> {
	params: {
		packId: string;
	}
}

interface PackItemState extends React.Props<PackItem> {
	model: Pack;
}

export default class PackItem extends React.Component<PackItemProps, PackItemState> {

	constructor(props: PackItemProps) {
		super(props);

		let pack = new Pack({id: props.params.packId});

		this.state = {
			model: pack
		}

		pack.on('update', () => {
			this.setState({
				model: pack
			})
		});
	}


	render() {
		var itemsComponents = this.state.model.items.map(item => {
			return <MediaItemView key={item._id} item={item}/>
		});

		return (
			<div className="section">
				<header className="section-header">
					<h2>{this.state.model.name}</h2>
				</header>

				<Grid>
					<Row>
						<Col xs={6}>
							<form>
								<Input type="text" label="Name" bsSize="medium" placeholder="Name" value={this.state.model.name} />
								<Input type="textarea" label="Description" placeholder="Description" value={this.state.model.get('description')} />
							</form>


							<div className="media-item-group">
								<h3>Items</h3>
								<div className="items">
									{itemsComponents}
								</div>
							</div>

						</Col>
					</Row>
				</Grid>
			</div>
		);
	}
}
