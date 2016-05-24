import * as React from 'react';
import * as _ from 'underscore';
import { Modal, Tabs, Tab, Button, Thumbnail, Alert} from 'react-bootstrap';
import Images from '../../Collections/Images';
import Image from '../../Models/Image';
import * as Firebase from 'firebase';
import { firebase as FirebaseConfig } from '../../config';
import { isURL } from 'validator';
const FormGroup = require('react-bootstrap/lib/FormGroup');
const FormControl = require('react-bootstrap/lib/FormControl');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');


interface ImageSelectionModalProps {
	show: boolean;
	getResizedImage?: (image: Image) => void;
}

interface ImageSelectionModalState {
	showModal?: boolean;
	images?: Images;
	loading?: boolean;
	image_url?: string;
	newImage?: Image;
	imageQueueRef?: Firebase;
	errMessage?: string;
}

export default class ImageSelectionModal extends React.Component<ImageSelectionModalProps, ImageSelectionModalState> {

	constructor(props: any) {
		super(props);

		this.state = {
			loading: true,
			image_url: '',
			showModal: props.show,
			errMessage: ''
		};
		this.close = this.close.bind(this);
		this.updateStateWithImages = this.updateStateWithImages.bind(this);
		this.checkURLAndSetPreview = this.checkURLAndSetPreview.bind(this);
		this.onUploadImage = this.onUploadImage.bind(this);
		this.onImageChange = this.onImageChange.bind(this);
	}

	close() {
		this.setState({
			errMessage: '',
			showModal: false
		});
	}

	componentDidMount() {
		let state = {
			images: new Images(),
			imageQueueRef: new Firebase(`${FirebaseConfig.BaseURL}/queues/image_resizing/tasks`),
			loading: true
		};
		state.images.fetch({
			success: this.updateStateWithImages
		});
		this.setState(state);
	}

	componentWillUnmount() {
		this.state.images.off('sync', this.updateStateWithImages);
		if (this.state.newImage) {
			this.state.newImage.off('change');
		}
	}

	updateStateWithImages(images: Images) {
		this.setState({
			images: images,
			loading: false
		});
	}

	componentWillReceiveProps(nextProps: ImageSelectionModalProps) {
		this.setState({
			showModal: nextProps.show
		});
	}

	onClickThumbnail(image: Image) {
		this.props.getResizedImage(image);
		this.setState({
			showModal: false
		});
	}

	checkURLAndSetPreview(e: any) {

		let url = e.target.value;
		let errMessage = '';
		let validUrl = isURL(url, { protocols: ['http', 'https'] });
		if (!validUrl) {
			errMessage = 'Invalid image url. Make sure that the protocol is http or https';
		}
		this.setState({
			image_url: url,
			errMessage: errMessage
		});
	}

	onImageChange (image: Image) {
		//Check if update
		this.state.images.fetch();
		this.state.newImage.off('change');
		this.setState({
			showModal: false
		});
	}

	onUploadImage() {
		let newImage = new Image({
			source_url: this.state.image_url
		});
		newImage.on('change', this.onImageChange);
		this.state.imageQueueRef.push({
			imageId: newImage.id,
			url: this.state.image_url
		});
		/* Check if changd after X number of seconds */
		setTimeout(() => { newImage.fetch(); }, 1000);
		this.setState({
			newImage: newImage
		});
	}


	render() {

		if (this.state.loading) {
			return <div> Loading... </div>;
		}

		let images = this.state.images.map(image => {
			return (
				<div className="image">
					<Thumbnail src={image.transforms.square.url} onClick={this.onClickThumbnail.bind(this, image)} />
				</div>
			);
		});

		let displayPreview = () => {
			if (this.state.image_url) {
				return (<Thumbnail src={this.state.image_url} />);
			}
		};

		let displayUploadButton = () => {
			if (this.state.image_url) {
				return (<Button bsStyle="primary" onClick={this.onUploadImage}>Upload Image</Button>);
			}
		};

		let displayErrorMessage = () => {
			if (this.state.errMessage) {
				return (<Alert bsStyle="danger">{this.state.errMessage}</Alert>);
			}
		};

		let tabulatedResults = (<Tabs
				id = "uncontrolled-modal-tab" >
				<Tab eventKey={0} title="Select Image">
					<div className="container-fluid">
						<div className="image-group">
							{images}
						</div>
					</div>
				</Tab>
				<Tab
					eventKey = {1}
					title = "New Image" >
					<FormGroup>
						<ControlLabel>Url</ControlLabel>
						<FormControl
							id="Url"
							type="text"
							placeholder="Paste in a URL with desired image.."
							value={this.state.image_url}
							onChange={this.checkURLAndSetPreview }/>
					</FormGroup>
					{displayPreview()}
				</Tab >
			</Tabs>);

		return (
			<Modal show={this.state.showModal} onHide={this.close} bsSize="large">
				<Modal.Body>
					{tabulatedResults}
					{displayErrorMessage()}
				</Modal.Body>
				<Modal.Footer>
					{displayUploadButton()}
					<Button onClick={this.close}>Close</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
