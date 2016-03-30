import * as React from 'react';
import { Grid, Row, Col, Input, Thumbnail } from 'react-bootstrap';
import Pack from "../../Models/Pack";
import MediaItemView from "../Components/MediaItemView";
import MediaItemType from "../../Models/MediaItemType";
import MediaItemSource from "../../Models/MediaItemSource";

interface PackItemProps extends React.Props<PackItem> {
	params: {
		packId: string;
	};
}

interface PackItemState extends React.Props<PackItem> {
	model: Pack;
}

export default class PackItem extends React.Component<PackItemProps, PackItemState> {

	constructor(props: PackItemProps) {
		super(props);

		let pack = new Pack({source: MediaItemSource.Often, type: MediaItemType.pack, id: props.params.packId});

		this.state = {
			model: pack
		};

		pack.on('update', () => {
			this.setState({
				model: pack
			});
		});
	}


	render() {
		var itemsComponents = this.state.model.items.map(item => {
			return <MediaItemView key={item._id} item={item}/>;
		});

		return (
			<div className="section">
				<header className="section-header">
					<h2>{this.state.model.name}</h2>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col xs={6}>
							<form>
								<Row>
									<Col xs={4}>
										<div class="image-upload">
											<Thumbnail src={this.state.model.get('image_url')} />
										</div>
									</Col>
									<Col xs={8}>
										<Input type="text" label="Name" bsSize="medium" placeholder="Name" value={this.state.model.name} />
										<Input type="textarea" label="Description" placeholder="Description" value={this.state.model.get('description')} />
									</Col>
								</Row>
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
