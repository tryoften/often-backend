import * as React from 'react';
import { Grid, Row, Col, Input, Thumbnail, Glyphicon } from 'react-bootstrap';
import Pack from '../../Models/Pack';
import MediaItemView from '../Components/MediaItemView';
import MediaItemType from '../../Models/MediaItemType';
import MediaItemSource from '../../Models/MediaItemSource';
import AddItemToPackModal from '../Components/AddItemToPackModal';
import * as classNames from 'classnames';

interface PackItemProps extends React.Props<PackItem> {
	params: {
		packId: string;
	};
}

interface PackItemState extends React.Props<PackItem> {
	model?: Pack;
	shouldShowSearchPanel?: boolean;
	display?: boolean;
}

export default class PackItem extends React.Component<PackItemProps, PackItemState> {
	constructor(props: PackItemProps) {
		super(props);

		let pack = new Pack({
			source: MediaItemSource.Often,
			type: MediaItemType.pack,
			id: props.params.packId
		});

		this.state = {
			model: pack,
			shouldShowSearchPanel: false,
			display: false
		};

		pack.on('update', this.updateStateWithPack.bind(this));
	}

	componentDidMount() {
		this.state.model.fetch({
			success: this.updateStateWithPack.bind(this)
		});
	}

	updateStateWithPack(pack: Pack) {
		this.setState({
			model: pack,
			display: true
		});
	}

	componentWillReceiveProps() {
		console.log('componentWillReceiveProps');
	}

	onClickAddItem(e: Event) {
		e.preventDefault();

		this.setState({
			shouldShowSearchPanel: true
		});
	}

	render() {
		var itemsComponents = this.state.model.items.map(item => {
			return <MediaItemView key={item._id} item={item} />;
		});

		let classes = classNames("section pack-item", {hidden: !this.state.display});

		return (
			<div className={classes}>
				<header className="section-header">
					<h2>{this.state.model.name}</h2>
				</header>

				<Grid fluid={true}>
					<Row>
						<Col xs={6}>
							<form>
								<Row>
									<Col xs={4}>
										<div className="image-upload">
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

									<div className="add-item pull-left" onClick={this.onClickAddItem.bind(this)}>
										<span className="text"><Glyphicon glyph="plus-sign" /> Add Item</span>
									</div>
								</div>
							</div>

						</Col>
						<Col xs={6}>
							<AddItemToPackModal show={this.state.shouldShowSearchPanel} />
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}
}
